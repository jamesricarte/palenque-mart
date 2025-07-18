const db = require("../../config/db")
const supabase = require("../../config/supabase")
const path = require("path")

const BUCKET_NAME = "seller-documents"

const resubmitDocument = async (req, res) => {
  const { documentId } = req.params
  const userId = req.user.id
  const file = req.file

  if (!file) {
    return res.status(400).json({
      message: "No file uploaded.",
      success: false,
      error: { code: "NO_FILE" },
    })
  }

  const connection = await db.getConnection()
  await connection.beginTransaction()

  try {
    // 1. Get document and verify ownership
    const [documents] = await connection.execute(
      `SELECT sd.*, sa.user_id, sa.application_id as app_uid 
       FROM seller_documents sd
       JOIN seller_applications sa ON sd.application_id = sa.id
       WHERE sd.id = ?`,
      [documentId],
    )

    if (documents.length === 0) {
      await connection.rollback()
      connection.release()
      return res.status(404).json({ message: "Document not found.", success: false })
    }

    const document = documents[0]

    if (document.user_id !== userId) {
      await connection.rollback()
      connection.release()
      return res.status(403).json({ message: "You are not authorized to modify this document.", success: false })
    }

    if (document.verification_status !== "rejected") {
      await connection.rollback()
      connection.release()
      return res.status(400).json({ message: "Only rejected documents can be re-uploaded.", success: false })
    }

    // 2. Delete old file from Supabase
    if (document.storage_key) {
      const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove([document.storage_key])
      if (deleteError) {
        // Log error but continue, as we are replacing it.
        console.error(`Failed to delete old file ${document.storage_key}:`, deleteError.message)
      }
    }

    // 3. Upload new file to Supabase
    const fileExt = path.extname(file.originalname)
    const newFilePath = `user_${userId}/${document.app_uid}/${document.document_type}-${Date.now()}${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(newFilePath, file.buffer, { contentType: file.mimetype })

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`)
    }

    // 4. Update document record in DB
    await connection.execute(
      `UPDATE seller_documents 
       SET storage_key = ?, file_name = ?, file_size = ?, mime_type = ?, 
           verification_status = 'pending', rejection_reason = NULL, updated_at = NOW()
       WHERE id = ?`,
      [newFilePath, file.originalname, file.size, file.mimetype, documentId],
    )

    // 5. Check if all documents are no longer rejected and update application status
    const [otherDocs] = await connection.execute(
      "SELECT verification_status FROM seller_documents WHERE application_id = ?",
      [document.application_id],
    )

    const hasRemainingRejectedDocs = otherDocs.some((doc) => doc.verification_status === "rejected")

    if (!hasRemainingRejectedDocs) {
      await connection.execute(
        "UPDATE seller_applications SET status = 'under_review', updated_at = NOW() WHERE id = ?",
        [document.application_id],
      )
    }

    await connection.commit()
    connection.release()

    res.status(200).json({
      message: "Document resubmitted successfully and is pending review.",
      success: true,
    })
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("Error resubmitting document:", error)
    return res.status(500).json({
      message: "Something went wrong while resubmitting the document.",
      success: false,
      error: { code: "RESUBMISSION_ERROR" },
    })
  }
}

module.exports = resubmitDocument
