const db = require("../../config/db");
const supabase = require("../../config/supabase");
const {
  sendDeliveryPartnerApprovalNotification,
} = require("../../utils/notifications");

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

      // If approved, create delivery partner record
      if (action === "approve") {
        // Generate unique partner ID
        const partnerId = application.application_id.replace("DPA", "DP");

        // Get user details for notification
        const [users] = await connection.execute(
          "SELECT first_name, last_name, email FROM users WHERE id = ?",
          [application.user_id]
        );
        const user = users[0];

        // Handle profile photo migration first
        let profilePictureKey = null;
        const [profilePhotos] = await connection.execute(
          "SELECT storage_key, file_name FROM delivery_partner_documents WHERE application_id = ? AND document_type = 'profile_photo'",
          [application.id]
        );

        if (profilePhotos.length > 0) {
          const profilePhoto = profilePhotos[0];
          const oldKey = profilePhoto.storage_key;
          const fileName = profilePhoto.file_name;

          try {
            // Download the file from the old location
            const { data: fileData, error: downloadError } =
              await supabase.storage
                .from("delivery-partner-documents")
                .download(oldKey);

            if (!downloadError && fileData) {
              // Upload to new location
              const newKey = `delivery-partners/${partnerId}/profile_photos/profile_photo_${Date.now()}.${fileName
                .split(".")
                .pop()}`;

              const { error: uploadError } = await supabase.storage
                .from("delivery-partner-assets")
                .upload(newKey, fileData, {
                  contentType: fileData.type,
                  upsert: false,
                });

              if (!uploadError) {
                profilePictureKey = newKey;

                // Remove old file
                await supabase.storage
                  .from("delivery-partner-documents")
                  .remove([oldKey]);

                // Delete the profile photo record from delivery_partner_documents
                await connection.execute(
                  "DELETE FROM delivery_partner_documents WHERE application_id = ? AND document_type = 'profile_photo'",
                  [application.id]
                );
              }
            }
          } catch (photoError) {
            console.error("Error migrating profile photo:", photoError);
            // Continue with approval even if photo migration fails
          }
        }

        // Create delivery partner record with profile picture
        await connection.execute(
          `
          INSERT INTO delivery_partners (
            user_id, application_id, partner_id, vehicle_type, license_number, 
            vehicle_registration, vehicle_make, vehicle_model, vehicle_year, 
            vehicle_color, company_name, service_areas, availability_hours,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            profile_picture, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
        `,
          [
            application.user_id,
            application.id,
            partnerId,
            application.vehicle_type,
            application.license_number,
            application.vehicle_registration,
            application.vehicle_make,
            application.vehicle_model,
            application.vehicle_year,
            application.vehicle_color,
            application.company_name,
            JSON.stringify(application.service_areas),
            JSON.stringify(application.availability_hours),
            application.emergency_contact_name,
            application.emergency_contact_phone,
            application.emergency_contact_relation,
            profilePictureKey,
          ]
        );

        // Send approval notification
        try {
          const userForNotification = {
            id: application.user_id,
            email: user.email,
            first_name: user.first_name,
            partner_id: partnerId,
            vehicle_type: application.vehicle_type,
          };

          // Note: wss should be passed from the main server file
          // For now, we'll just send email notification
          await sendDeliveryPartnerApprovalNotification(
            userForNotification,
            req.app.get("wss")
          );
        } catch (notificationError) {
          console.error(
            "Error sending approval notification:",
            notificationError
          );
          // Continue with approval even if notification fails
        }

        console.log(
          `Delivery partner application ${applicationId} approved, partner created with ID: ${partnerId}`
        );
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
          ...(action === "approve" && {
            partnerId: application.application_id.replace("DPA", "DP"),
          }),
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
