const db = require("../../config/db")

const reviewSellerApplication = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { action, rejectionReason } = req.body
    const adminId = req.user.id

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Must be 'approve' or 'reject'",
        success: false,
        error: { code: "INVALID_ACTION" },
      })
    }

    if (action === "reject" && !rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required when rejecting application",
        success: false,
        error: { code: "REJECTION_REASON_REQUIRED" },
      })
    }

    // Get application details
    const [applications] = await db.execute("SELECT * FROM seller_applications WHERE application_id = ?", [
      applicationId,
    ])

    if (applications.length === 0) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
        error: { code: "NOT_FOUND" },
      })
    }

    const application = applications[0]

    if (application.status !== "pending" && application.status !== "under_review") {
      return res.status(400).json({
        message: "Application has already been reviewed",
        success: false,
        error: { code: "ALREADY_REVIEWED" },
      })
    }

    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      const newStatus = action === "approve" ? "approved" : "rejected"

      // Update application status
      await connection.execute(
        `
        UPDATE seller_applications 
        SET status = ?, rejection_reason = ?, reviewed_at = NOW(), reviewed_by = ?
        WHERE application_id = ?
      `,
        [newStatus, rejectionReason || null, adminId, applicationId],
      )

      // If approved, create seller record
      if (action === "approve") {
        // Get store profile
        const [storeProfiles] = await connection.execute(
          "SELECT * FROM seller_store_profiles WHERE application_id = ?",
          [application.id],
        )

        if (storeProfiles.length > 0) {
          const storeProfile = storeProfiles[0]
          const sellerId = `SELL${Date.now().toString().slice(-8)}`

          await connection.execute(
            `
            INSERT INTO sellers (
              user_id, application_id, seller_id, account_type, 
              store_name, store_description, store_logo_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
            [
              application.user_id,
              application.id,
              sellerId,
              application.account_type,
              storeProfile.store_name,
              storeProfile.store_description,
              storeProfile.store_logo_path,
            ],
          )
        }
      }

      await connection.commit()
      connection.release()

      res.status(200).json({
        message: `Application ${action}d successfully`,
        success: true,
        data: {
          applicationId,
          status: newStatus,
          reviewedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error("Error reviewing application:", error)
    return res.status(500).json({
      message: "Something went wrong while reviewing application.",
      success: false,
      error: { code: "REVIEW_ERROR" },
    })
  }
}

module.exports = reviewSellerApplication
