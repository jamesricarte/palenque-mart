const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

const submitSellerApplication = async (req, res) => {
  const userId = req.user.id;
  const {
    accountType,
    businessName,
    businessRegNumber,
    contactPerson,
    businessAddress,
    pickupAddress,
    returnAddress,
    storeLocation,
    storeName,
    storeDescription,
    documents,
  } = req.body;

  // Basic validation
  const requiredFields = {
    accountType,
    pickupAddress,
    returnAddress,
    storeName,
    storeDescription,
  };

  // Add business fields validation for business accounts
  if (accountType === "business") {
    requiredFields.businessName = businessName;
    requiredFields.businessRegNumber = businessRegNumber;
    requiredFields.contactPerson = contactPerson;
    requiredFields.businessAddress = businessAddress;
  }

  const formValidation = formValidator.validate(requiredFields);

  if (!formValidation.validation) {
    console.log(formValidation);
    return res.status(400).json({
      message: formValidation.message,
      success: false,
      error: formValidation?.error,
    });
  }

  // Check if user already has a pending or approved application
  try {
    const [existingApplication] = await db.execute(
      "SELECT * FROM seller_applications WHERE user_id = ? AND status IN ('pending', 'approved', 'under_review')",
      [userId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({
        message: "You already have an active seller application",
        success: false,
        error: {
          code: "APPLICATION_EXISTS",
        },
      });
    }

    // Generate unique application ID
    const applicationId = `APP${Date.now().toString().slice(-8)}`;

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert seller application
      const [applicationResult] = await connection.execute(
        "INSERT INTO seller_applications (user_id, application_id, account_type, status) VALUES (?, ?, ?, 'pending')",
        [userId, applicationId, accountType]
      );

      const dbApplicationId = applicationResult.insertId;

      // Insert business details if business account
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

      // Insert address details
      await connection.execute(
        "INSERT INTO seller_addresses (application_id, pickup_address, return_address, store_location) VALUES (?, ?, ?, ?)",
        [dbApplicationId, pickupAddress, returnAddress, storeLocation || null]
      );

      // Insert store profile
      await connection.execute(
        "INSERT INTO seller_store_profiles (application_id, store_name, store_description) VALUES (?, ?, ?)",
        [dbApplicationId, storeName, storeDescription]
      );

      // Insert document records (files would be uploaded separately)
      if (documents && Array.isArray(documents)) {
        for (const doc of documents) {
          await connection.execute(
            "INSERT INTO seller_documents (application_id, document_type, file_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)",
            [
              dbApplicationId,
              doc.type,
              doc.fileName,
              doc.filePath,
              doc.fileSize,
              doc.mimeType,
            ]
          );
        }
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      res.status(201).json({
        message: "Seller application submitted successfully!",
        success: true,
        data: {
          applicationId: applicationId,
          status: "pending",
        },
      });
    } catch (error) {
      // Rollback transaction
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error submitting seller application:", error);
    return res.status(500).json({
      message: "Something went wrong while submitting your application.",
      success: false,
      error: {
        code: "SUBMISSION_ERROR",
      },
    });
  }
};

module.exports = submitSellerApplication;
