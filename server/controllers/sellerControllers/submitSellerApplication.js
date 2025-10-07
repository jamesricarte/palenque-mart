const db = require("../../config/db");
const supabase = require("../../config/supabase");
const formValidator = require("../../utils/formValidator");
const path = require("path");

const BUCKET_NAME = "seller-documents";

const submitSellerApplication = async (req, res) => {
  const userId = req.user.id;
  const {
    accountType,
    businessName,
    businessRegNumber,
    contactPerson,
    businessAddress,
    addresses, // New addresses structure
    storeName,
    storeDescription,
    weekdayOpeningTime,
    weekdayClosingTime,
    weekendOpeningTime,
    weekendClosingTime,
  } = req.body;

  const files = req.files || {};

  // Basic validation
  const requiredFields = {
    accountType,
    storeName,
    storeDescription,
  };

  if (accountType === "business") {
    Object.assign(requiredFields, {
      businessName,
      businessRegNumber,
      contactPerson,
      businessAddress,
    });
  }

  const formValidation = formValidator.validate(requiredFields);
  if (!formValidation.validation) {
    return res.status(400).json({
      message: formValidation.message,
      success: false,
      error: formValidation?.error,
    });
  }

  // Validate addresses
  let parsedAddresses;
  try {
    parsedAddresses =
      typeof addresses === "string" ? JSON.parse(addresses) : addresses;
  } catch (error) {
    return res.status(400).json({
      message: "Invalid addresses format",
      success: false,
      error: { code: "INVALID_ADDRESSES" },
    });
  }

  if (
    !parsedAddresses ||
    !parsedAddresses.pickup ||
    !parsedAddresses.return ||
    !parsedAddresses.store
  ) {
    return res.status(400).json({
      message: "All address types (pickup, return, store) are required",
      success: false,
      error: { code: "MISSING_ADDRESSES" },
    });
  }

  // Validate required documents
  const requiredDocuments = ["government_id", "selfie_with_id"];
  const missingDocuments = requiredDocuments.filter(
    (docType) => !files[docType]
  );
  if (missingDocuments.length > 0) {
    return res.status(400).json({
      message: `Missing required documents: ${missingDocuments.join(", ")}`,
      success: false,
      error: { code: "MISSING_DOCUMENTS" },
    });
  }

  try {
    const [existingApplication] = await db.execute(
      "SELECT * FROM seller_applications WHERE user_id = ? AND status IN ('pending', 'approved', 'under_review')",
      [userId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({
        message: "You already have an active seller application",
        success: false,
        error: { code: "APPLICATION_EXISTS" },
      });
    }

    const applicationId = `APP${Date.now().toString().slice(-8)}`;
    const connection = await db.getConnection();
    await connection.beginTransaction();

    const uploadedFilePaths = {};

    try {
      const [applicationResult] = await connection.execute(
        "INSERT INTO seller_applications (user_id, application_id, account_type, status) VALUES (?, ?, ?, 'pending')",
        [userId, applicationId, accountType]
      );
      const dbApplicationId = applicationResult.insertId;

      // Upload files to Supabase and collect paths
      for (const fieldName in files) {
        const file = files[fieldName][0];
        const fileExt = path.extname(file.originalname);
        const filePath = `user_${userId}/${applicationId}/${fieldName}-${Date.now()}${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (uploadError) {
          throw new Error(
            `Supabase upload failed for ${fieldName}: ${uploadError.message}`
          );
        }
        uploadedFilePaths[fieldName] = filePath;
      }

      // Insert business details
      if (accountType === "business") {
        await connection.execute(
          "INSERT INTO seller_business_details (application_id, business_name, business_registration_number, contact_person, business_address) VALUES (?, ?, ?, ?, ?)",
          [
            dbApplicationId,
            businessName,
            businessRegNumber,
            contactPerson,
            businessAddress,
          ]
        );
      }

      // Insert address details - New structure
      const addressTypes = ["pickup", "return", "store"];
      for (const addressType of addressTypes) {
        const addressData = parsedAddresses[addressType];
        if (addressData) {
          await connection.execute(
            "INSERT INTO seller_addresses (application_id, type, street_address, barangay, city, province, postal_code, landmark, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              dbApplicationId,
              addressType,
              addressData.streetAddress,
              addressData.barangay,
              addressData.city,
              addressData.province,
              addressData.postalCode || null,
              addressData.landmark || null,
              addressData.latitude,
              addressData.longitude,
            ]
          );
        }
      }

      // Insert store profile
      await connection.execute(
        `INSERT INTO seller_store_profiles (
          application_id, store_name, store_description, store_logo_key,
          weekday_opening_time, weekday_closing_time,
          weekend_opening_time, weekend_closing_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dbApplicationId,
          storeName,
          storeDescription,
          uploadedFilePaths.store_logo || null,
          weekdayOpeningTime || null,
          weekdayClosingTime || null,
          weekendOpeningTime || null,
          weekendClosingTime || null,
        ]
      );

      // Insert document records
      for (const fieldName in files) {
        const file = files[fieldName][0];
        if (uploadedFilePaths[fieldName]) {
          await connection.execute(
            "INSERT INTO seller_documents (application_id, document_type, storage_key, file_name, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)",
            [
              dbApplicationId,
              fieldName,
              uploadedFilePaths[fieldName],
              file.originalname,
              file.size,
              file.mimetype,
            ]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: "Seller application submitted successfully!",
        success: true,
        data: { applicationId, status: "pending" },
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      // Attempt to clean up files from Supabase if DB transaction fails
      for (const path of Object.values(uploadedFilePaths)) {
        await supabase.storage.from(BUCKET_NAME).remove([path]);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error submitting seller application:", error);
    return res.status(500).json({
      message: "Something went wrong while submitting your application.",
      success: false,
      error: { code: "SUBMISSION_ERROR" },
    });
  }
};

module.exports = submitSellerApplication;
