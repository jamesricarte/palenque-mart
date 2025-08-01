const db = require("../../config/db");
const supabase = require("../../config/supabase");

const reviewDeliveryPartnerApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { action, rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Must be 'approve' or 'reject'",
        success: false,
        error: { code: "INVALID_ACTION" },
      });
    }

    if (action === "reject" && !rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required when rejecting application",
        success: false,
        error: { code: "REJECTION_REASON_REQUIRED" },
      });
    }

    // Get application details
    const [applications] = await db.execute(
      "SELECT * FROM delivery_partner_applications WHERE application_id = ?",
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
        error: { code: "NOT_FOUND" },
      });
    }

    const application = applications[0];

    if (
      application.status !== "pending" &&
      application.status !== "under_review"
    ) {
      return res.status(400).json({
        message: "Application has already been reviewed",
        success: false,
        error: { code: "ALREADY_REVIEWED" },
      });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const newStatus = action === "approve" ? "approved" : "rejected";

      // Update application status
      await connection.execute(
        `
        UPDATE delivery_partner_applications 
        SET status = ?, rejection_reason = ?, reviewed_at = NOW(), reviewed_by = ?
        WHERE application_id = ?
      `,
        [newStatus, rejectionReason || null, adminId, applicationId]
      );

      // If approved, create delivery partner record (if you have such a table)
      if (action === "approve") {
        // You can add logic here to create a delivery partner record
        // similar to how sellers are created when approved
        console.log(`Delivery partner application ${applicationId} approved`);
      }

      // If rejected, delete all associated documents from storage
      if (action === "reject") {
        const [documents] = await connection.execute(
          "SELECT storage_key FROM delivery_partner_documents WHERE application_id = ?",
          [application.id]
        );

        if (documents.length > 0) {
          const storageKeys = documents
            .map((doc) => doc.storage_key)
            .filter((key) => key);
          if (storageKeys.length > 0) {
            await supabase.storage
              .from("delivery-partner-documents")
              .remove(storageKeys);
          }
        }

        // Update all document statuses to 'rejected'
        await connection.execute(
          "UPDATE delivery_partner_documents SET verification_status = 'rejected' WHERE application_id = ?",
          [application.id]
        );
      }

      await connection.commit();
      connection.release();

      res.status(200).json({
        message: `Application ${action}d successfully`,
        success: true,
        data: {
          applicationId,
          status: newStatus,
          reviewedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error reviewing application:", error);
    return res.status(500).json({
      message: "Something went wrong while reviewing application.",
      success: false,
      error: { code: "REVIEW_ERROR" },
    });
  }
};

module.exports = reviewDeliveryPartnerApplication;
