const db = require("../../config/db");
const supabase = require("../../config/supabase");
const { v4: uuidv4 } = require("uuid");

const submitDeliveryPartnerApplication = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const {
      vehicleType,
      licenseNumber,
      vehicleRegistration,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      companyName,
      serviceAreas,
      availabilityHours,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
    } = req.body;

    // Check if user already has a delivery partner application
    const [existingApplications] = await connection.execute(
      "SELECT id FROM delivery_partner_applications WHERE user_id = ?",
      [userId]
    );

    if (existingApplications.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "You already have a delivery partner application",
        success: false,
        error: { code: "APPLICATION_EXISTS" },
      });
    }

    // Generate unique application ID
    const applicationId = `DPA${Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0")}`;

    // Parse JSON fields
    const parsedServiceAreas =
      typeof serviceAreas === "string"
        ? JSON.parse(serviceAreas)
        : serviceAreas;
    const parsedAvailabilityHours =
      typeof availabilityHours === "string"
        ? JSON.parse(availabilityHours)
        : availabilityHours;

    // Insert delivery partner application
    const [applicationResult] = await connection.execute(
      `INSERT INTO delivery_partner_applications 
       (user_id, application_id, vehicle_type, license_number, vehicle_registration, 
        vehicle_make, vehicle_model, vehicle_year, vehicle_color, company_name, 
        service_areas, availability_hours, emergency_contact_name, 
        emergency_contact_phone, emergency_contact_relation, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        applicationId,
        vehicleType,
        licenseNumber,
        vehicleRegistration,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        companyName || "Independent",
        JSON.stringify(parsedServiceAreas),
        JSON.stringify(parsedAvailabilityHours),
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
      ]
    );

    const applicationDbId = applicationResult.insertId;

    // Handle document uploads
    const documentTypes = [
      "drivers_license",
      "vehicle_registration",
      "profile_photo",
      "insurance",
      "background_check",
    ];
    const uploadedDocuments = [];

    for (const docType of documentTypes) {
      if (req.files && req.files[docType] && req.files[docType][0]) {
        const file = req.files[docType][0];
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `${docType}-${Date.now()}.${fileExtension}`;
        const filePath = `user_${userId}/${applicationId}/${fileName}`;

        try {
          // Upload to Supabase
          const { data, error } = await supabase.storage
            .from("delivery-partner-documents")
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (error) {
            console.error(`Error uploading ${docType}:`, error);
            throw error;
          }

          // Insert document record
          await connection.execute(
            `INSERT INTO delivery_partner_documents 
             (application_id, document_type, storage_key, file_name, file_size, mime_type) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              applicationDbId,
              docType,
              filePath,
              file.originalname,
              file.size,
              file.mimetype,
            ]
          );

          uploadedDocuments.push({
            type: docType,
            fileName: file.originalname,
            size: file.size,
          });
        } catch (uploadError) {
          console.error(`Error uploading ${docType}:`, uploadError);
          // Continue with other documents, don't fail the entire application
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      message: "Delivery partner application submitted successfully",
      success: true,
      data: {
        applicationId,
        uploadedDocuments,
        status: "pending",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error submitting delivery partner application:", error);
    res.status(500).json({
      message: "Failed to submit application",
      success: false,
      error: { code: "SUBMISSION_ERROR" },
    });
  } finally {
    connection.release();
  }
};

module.exports = submitDeliveryPartnerApplication;
