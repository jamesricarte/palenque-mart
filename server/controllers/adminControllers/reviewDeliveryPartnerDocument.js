const db = require("../../config/db");

const reviewDeliveryPartnerDocument = async (req, res) => {
  const { documentId } = req.params;
  const { action, rejectionReason } = req.body;
  const adminId = req.user.id;

  if (!["verify", "reject"].includes(action)) {
    return res.status(400).json({
      message: "Invalid action. Must be 'verify' or 'reject'",
      success: false,
      error: { code: "INVALID_ACTION" },
    });
  }

  if (action === "reject" && !rejectionReason) {
    return res.status(400).json({
      message: "Rejection reason is required when rejecting a document",
      success: false,
      error: { code: "REJECTION_REASON_REQUIRED" },
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [documents] = await connection.execute(
      "SELECT * FROM delivery_partner_documents WHERE id = ?",
      [documentId]
    );

    if (documents.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        message: "Document not found",
        success: false,
        error: { code: "NOT_FOUND" },
      });
    }

    const document = documents[0];
    const applicationId = document.application_id;
    const newStatus = action === "verify" ? "verified" : "rejected";
    const reason = action === "reject" ? rejectionReason : null;

    // Update the document's status
    await connection.execute(
      "UPDATE delivery_partner_documents SET verification_status = ?, rejection_reason = ? WHERE id = ?",
      [newStatus, reason, documentId]
    );

    // Update the overall application status based on the action
    if (action === "reject") {
      // If any document is rejected, the application needs resubmission
      await connection.execute(
        "UPDATE delivery_partner_applications SET status = 'needs_resubmission', updated_at = NOW() WHERE id = ?",
        [applicationId]
      );
    } else if (action === "verify") {
      // If a document is verified, check if all required documents are now verified
      const [allDocs] = await connection.execute(
        "SELECT * FROM delivery_partner_documents WHERE application_id = ?",
        [applicationId]
      );

      const requiredDocTypes = [
        "drivers_license",
        "vehicle_registration",
        "profile_photo",
      ];

      const allRequiredDocsVerified = allDocs
        .filter((doc) => requiredDocTypes.includes(doc.document_type))
        .every((doc) => doc.verification_status === "verified");

      if (allRequiredDocsVerified) {
        // If all are verified, move the application to 'under_review' for final approval
        await connection.execute(
          "UPDATE delivery_partner_applications SET status = 'under_review', updated_at = NOW() WHERE id = ?",
          [applicationId]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(200).json({
      message: `Document ${action}d successfully`,
      success: true,
      data: {
        documentId,
        status: newStatus,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error reviewing document:", error);
    return res.status(500).json({
      message: "Something went wrong while reviewing the document.",
      success: false,
      error: { code: "REVIEW_ERROR" },
    });
  }
};

module.exports = reviewDeliveryPartnerDocument;
