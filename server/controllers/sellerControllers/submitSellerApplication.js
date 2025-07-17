const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");
const path = require("path");
const fs = require("fs").promises;

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
  } = req.body;

  // Get uploaded files
  const files = req.files || {};

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
    // Clean up uploaded files if validation fails
    await cleanupUploadedFiles(files);

    return res.status(400).json({
      message: formValidation.message,
      success: false,
      error: formValidation?.error,
    });
  }

  // Validate required documents
  const requiredDocuments = ["government_id", "selfie_with_id"];
  const missingDocuments = requiredDocuments.filter(
    (docType) => !files[docType]
  );

  if (missingDocuments.length > 0) {
    await cleanupUploadedFiles(files);

    return res.status(400).json({
      message: `Missing required documents: ${missingDocuments.join(", ")}`,
      success: false,
      error: { code: "MISSING_DOCUMENTS" },
    });
  }

  // Check if user already has a pending or approved application
  try {
    const [existingApplication] = await db.execute(
      "SELECT * FROM seller_applications WHERE user_id = ? AND status IN ('pending', 'approved', 'under_review')",
      [userId]
    );

    if (existingApplication.length > 0) {
      await cleanupUploadedFiles(files);

      return res.status(400).json({
        message: "You already have an active seller application",
        success: false,
        error: { code: "APPLICATION_EXISTS" },
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
        "INSERT INTO seller_store_profiles (application_id, store_name, store_description, store_logo_path) VALUES (?, ?, ?, ?)",
        [
          dbApplicationId,
          storeName,
          storeDescription,
          files.store_logo ? files.store_logo[0].path : null,
        ]
      );

      // Insert document records
      const documentTypes = {
        government_id: "government_id",
        selfie_with_id: "selfie_with_id",
        business_documents: "business_documents",
        bank_statement: "bank_statement",
      };

      for (const [fieldName, documentType] of Object.entries(documentTypes)) {
        if (files[fieldName] && files[fieldName][0]) {
          const file = files[fieldName][0];

          await connection.execute(
            "INSERT INTO seller_documents (application_id, document_type, file_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)",
            [
              dbApplicationId,
              documentType,
              file.originalname,
              file.path,
              file.size,
              file.mimetype,
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

      // Clean up uploaded files on error
      await cleanupUploadedFiles(files);

      throw error;
    }
  } catch (error) {
    console.error("Error submitting seller application:", error);

    // Clean up uploaded files on error
    await cleanupUploadedFiles(files);

    return res.status(500).json({
      message: "Something went wrong while submitting your application.",
      success: false,
      error: { code: "SUBMISSION_ERROR" },
    });
  }
};

// Helper function to clean up uploaded files (now async)
const cleanupUploadedFiles = async (files) => {
  try {
    const deletePromises = [];

    Object.values(files).forEach((fileArray) => {
      if (Array.isArray(fileArray)) {
        fileArray.forEach((file) => {
          // Add each file deletion to promises array
          deletePromises.push(
            fs
              .access(file.path)
              .then(() => fs.unlink(file.path))
              .catch((error) => {
                // File doesn't exist or can't be deleted, log but don't throw
                console.warn(
                  `Could not delete file ${file.path}:`,
                  error.message
                );
              })
          );
        });
      }
    });

    // Wait for all file deletions to complete
    await Promise.allSettled(deletePromises);
  } catch (error) {
    console.error("Error cleaning up files:", error);
  }
};

module.exports = submitSellerApplication;
