const db = require("../../config/db")
const supabase = require("../../config/supabase")

const resubmitDocuments = async (req, res) => {
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    const userId = req.user.id

    // Get the user's application
    const [applications] = await connection.execute(
      "SELECT id, application_id FROM delivery_partner_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId],
    )

    if (applications.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        message: "No delivery partner application found",
        success: false,
      })
    }

    const application = applications[0]
    const applicationDbId = application.id
    const applicationId = application.application_id

    // Handle document uploads
    const documentTypes = ["drivers_license", "vehicle_registration", "profile_photo", "insurance", "background_check"]
    const resubmittedDocuments = []

    for (const docType of documentTypes) {
      if (req.files && req.files[docType] && req.files[docType][0]) {
        const file = req.files[docType][0]
        const fileExtension = file.originalname.split(".").pop()
        const fileName = `${docType}-${Date.now()}.${fileExtension}`
        const filePath = `user_${userId}/${applicationId}/${fileName}`

        try {
          // Upload new document to Supabase
          const { data, error } = await supabase.storage
            .from("delivery-partner-documents")
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            })

          if (error) {
            console.error(`Error uploading ${docType}:`, error)
            throw error
          }

          // Update document record
          await connection.execute(
            `UPDATE delivery_partner_documents 
             SET storage_key = ?, file_name = ?, file_size = ?, mime_type = ?, 
                 verification_status = 'pending', updated_at = CURRENT_TIMESTAMP
             WHERE application_id = ? AND document_type = ?`,
            [filePath, file.originalname, file.size, file.mimetype, applicationDbId, docType],
          )

          resubmittedDocuments.push({
            type: docType,
            fileName: file.originalname,
            size: file.size,
          })
        } catch (uploadError) {
          console.error(`Error uploading ${docType}:`, uploadError)
          // Continue with other documents
        }
      }
    }

    // Update application status to under_review
    await connection.execute(
      "UPDATE delivery_partner_applications SET status = 'under_review', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [applicationDbId],
    )

    await connection.commit()

    res.status(200).json({
      message: "Documents resubmitted successfully",
      success: true,
      data: {
        applicationId,
        resubmittedDocuments,
        status: "under_review",
      },
    })
  } catch (error) {
    await connection.rollback()
    console.error("Error resubmitting documents:", error)
    res.status(500).json({
      message: "Failed to resubmit documents",
      success: false,
      error: { code: "RESUBMISSION_ERROR" },
    })
  } finally {
    connection.release()
  }
}

module.exports = resubmitDocuments
