const db = require("../../config/db");
const supabase = require("../../config/supabase");
const path = require("path");

const BUCKET_NAME = "seller-documents";

const resubmitDocuments = async (req, res) => {
  const userId = req.user.id;
  const files = req.files;

  // Check if files object exists and has at least one field with files
  if (!files || Object.keys(files).length === 0) {
    return res.status(400).json({
      message: "No files were uploaded.",
      success: false,
      error: { code: "NO_FILES_UPLOADED" },
    });
  }

  // Check if any field has files
  const hasFiles = Object.values(files).some(
    (fieldFiles) => fieldFiles && fieldFiles.length > 0
  );
  if (!hasFiles) {
    return res.status(400).json({
      message: "No files were uploaded.",
      success: false,
      error: { code: "NO_FILES_UPLOADED" },
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Get the user's application that needs resubmission
    const [applications] = await connection.execute(
      "SELECT id, application_id FROM seller_applications WHERE user_id = ? AND status = 'needs_resubmission' ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (applications.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        message: "No active application requiring resubmission found.",
        success: false,
        error: { code: "NO_APPLICATION_FOUND" },
      });
    }
    const application = applications[0];

    // 2. Process each uploaded file field
    for (const [documentType, fieldFiles] of Object.entries(files)) {
      if (!fieldFiles || fieldFiles.length === 0) continue;

      const file = fieldFiles[0]; // Take the first file from each field

      // Get document details by document_type and verify ownership and status
      const [documents] = await connection.execute(
        "SELECT * FROM seller_documents WHERE document_type = ? AND application_id = ?",
        [documentType, application.id]
      );

      if (documents.length === 0) {
        throw new Error(
          `Document with type ${documentType} not found for this application.`
        );
      }
      const document = documents[0];

      if (document.verification_status !== "rejected") {
        throw new Error(
          `Document ${document.document_type} is not in a rejected state.`
        );
      }

      // Delete old file from Supabase
      if (document.storage_key) {
        await supabase.storage.from(BUCKET_NAME).remove([document.storage_key]);
      }

      // Upload new file
      const fileExt = path.extname(file.originalname);
      const newFilePath = `user_${userId}/${application.application_id}/${
        document.document_type
      }-${Date.now()}${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(newFilePath, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        throw new Error(
          `Supabase upload failed for ${document.document_type}: ${uploadError.message}`
        );
      }

      // Update document record in DB
      await connection.execute(
        `UPDATE seller_documents SET storage_key = ?, file_name = ?, file_size = ?, mime_type = ?, verification_status = 'pending', rejection_reason = NULL, updated_at = NOW() WHERE id = ?`,
        [newFilePath, file.originalname, file.size, file.mimetype, document.id]
      );
    }

    // 3. Check if all documents are no longer rejected and update application status
    const [allDocs] = await connection.execute(
      "SELECT verification_status FROM seller_documents WHERE application_id = ?",
      [application.id]
    );

    const hasRemainingRejectedDocs = allDocs.some(
      (doc) => doc.verification_status === "rejected"
    );

    if (!hasRemainingRejectedDocs) {
      await connection.execute(
        "UPDATE seller_applications SET status = 'under_review', updated_at = NOW() WHERE id = ?",
        [application.id]
      );
    }

    await connection.commit();
    connection.release();

    res.status(200).json({
      message: "Documents resubmitted successfully and are now pending review.",
      success: true,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error resubmitting documents:", error);
    return res.status(500).json({
      message:
        error.message || "Something went wrong while resubmitting documents.",
      success: false,
      error: { code: "RESUBMISSION_ERROR" },
    });
  }
};

module.exports = resubmitDocuments;
