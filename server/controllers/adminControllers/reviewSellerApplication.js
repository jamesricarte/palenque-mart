const db = require("../../config/db");
const supabase = require("../../config/supabase");
const { sendSellerApprovalNotification } = require("../../utils/notifications");

const reviewSellerApplication = async (req, res) => {
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
      "SELECT * FROM seller_applications WHERE application_id = ?",
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
    UPDATE seller_applications 
    SET status = ?, rejection_reason = ?, reviewed_at = NOW(), reviewed_by = ?
    WHERE application_id = ?
  `,
        [newStatus, rejectionReason || null, adminId, applicationId]
      );

      // If approved, create seller record
      if (action === "approve") {
        // Get store profile
        const [storeProfiles] = await connection.execute(
          "SELECT * FROM seller_store_profiles WHERE application_id = ?",
          [application.id]
        );

        if (storeProfiles.length > 0) {
          const storeProfile = storeProfiles[0];
          const sellerId = `SELL${Date.now().toString().slice(-8)}`;

          await connection.execute(
            `
INSERT INTO sellers (
  user_id, application_id, seller_id, account_type, 
  store_name, store_description, store_logo_key
) VALUES (?, ?, ?, ?, ?, ?, ?)
`,
            [
              application.user_id,
              application.id,
              sellerId,
              application.account_type,
              storeProfile.store_name,
              storeProfile.store_description,
              null, // Will be updated after logo migration
            ]
          );

          // Handle store logo migration if it exists
          const [storeLogoDocuments] = await connection.execute(
            "SELECT * FROM seller_documents WHERE application_id = ? AND document_type = 'store_logo'",
            [application.id]
          );

          let publicStoreLogoKey = null;

          if (storeLogoDocuments.length > 0) {
            const storeLogoDoc = storeLogoDocuments[0];

            try {
              // Download the file from seller-documents bucket
              const { data: fileData, error: downloadError } =
                await supabase.storage
                  .from("seller-documents")
                  .download(storeLogoDoc.storage_key);

              if (downloadError) {
                console.error("Error downloading store logo:", downloadError);
              } else {
                // Create new path in vendor-assets bucket
                const fileExtension = storeLogoDoc.file_name.split(".").pop();
                const newFileName = `store_logo_${Date.now()}.${fileExtension}`;
                publicStoreLogoKey = `sellers/${sellerId}/store_logos/${newFileName}`;

                // Upload to vendor-assets bucket (public)
                const { error: uploadError } = await supabase.storage
                  .from("vendor-assets")
                  .upload(publicStoreLogoKey, fileData, {
                    contentType: storeLogoDoc.mime_type,
                    upsert: false,
                  });

                if (uploadError) {
                  console.error(
                    "Error uploading to vendor-assets:",
                    uploadError
                  );
                  publicStoreLogoKey = null;
                } else {
                  // Delete from seller-documents bucket
                  await supabase.storage
                    .from("seller-documents")
                    .remove([storeLogoDoc.storage_key]);

                  // Delete store logo record from seller_documents table
                  await connection.execute(
                    "DELETE FROM seller_documents WHERE application_id = ? AND document_type = 'store_logo'",
                    [application.id]
                  );

                  // Update seller_store_profiles with new public path
                  await connection.execute(
                    "UPDATE seller_store_profiles SET store_logo_key = ? WHERE application_id = ?",
                    [publicStoreLogoKey, application.id]
                  );

                  // Update sellers table with new public path
                  await connection.execute(
                    "UPDATE sellers SET store_logo_key = ? WHERE application_id = ?",
                    [publicStoreLogoKey, application.id]
                  );

                  console.log(
                    `Store logo migrated successfully for seller ${sellerId}`
                  );
                }
              }
            } catch (error) {
              console.error("Error during store logo migration:", error);
              // Continue with approval even if logo migration fails
            }
          }

          // Fetch user details for notification
          const [users] = await connection.execute(
            `SELECT u.id, u.email, u.first_name, ssp.store_name 
           FROM users u 
           JOIN seller_applications sa ON u.id = sa.user_id 
           LEFT JOIN seller_store_profiles ssp ON sa.id = ssp.application_id 
           WHERE sa.id = ?`,
            [application.id]
          );
          const userForNotification = users[0];

          if (userForNotification) {
            // Send notifications (email and push via WebSocket)
            sendSellerApprovalNotification(
              userForNotification,
              req.app.get("wss")
            );
          }
        }
      }

      // If rejected, delete all associated documents from storage and update their status
      if (action === "reject") {
        const [documents] = await connection.execute(
          "SELECT storage_key FROM seller_documents WHERE application_id = ?",
          [application.id]
        );

        if (documents.length > 0) {
          const storageKeys = documents
            .map((doc) => doc.storage_key)
            .filter((key) => key);
          if (storageKeys.length > 0) {
            await supabase.storage.from("seller-documents").remove(storageKeys);
          }
        }

        // Also update all document statuses to 'rejected'
        await connection.execute(
          "UPDATE seller_documents SET verification_status = 'rejected' WHERE application_id = ?",
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

module.exports = reviewSellerApplication;
