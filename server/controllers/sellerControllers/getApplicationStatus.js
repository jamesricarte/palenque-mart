const db = require("../../config/db");

const getApplicationStatus = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get the latest seller application for this user
    const [applications] = await db.execute(
      `SELECT 
        sa.id,
        sa.application_id,
        sa.account_type,
        sa.status,
        sa.rejection_reason,
        sa.created_at,
        sa.updated_at,
        sa.reviewed_at,
        ssp.store_name,
        ssp.store_description
      FROM seller_applications sa
      LEFT JOIN seller_store_profiles ssp ON sa.id = ssp.application_id
      WHERE sa.user_id = ?
      ORDER BY sa.created_at DESC
      LIMIT 1`,
      [userId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        message: "No seller application found",
        success: false,
        hasApplication: false,
      });
    }

    const application = applications[0];

    // Get business details if business account
    let businessDetails = null;
    if (application.account_type === "business") {
      const [business] = await db.execute(
        "SELECT business_name, business_registration_number, contact_person FROM seller_business_details WHERE application_id = ?",
        [application.id]
      );
      businessDetails = business[0] || null;
    }

    // Get address details
    const [addresses] = await db.execute(
      "SELECT pickup_address, return_address, store_location FROM seller_addresses WHERE application_id = ?",
      [application.id]
    );

    // Get document status
    const [documents] = await db.execute(
      "SELECT document_type, verification_status FROM seller_documents WHERE application_id = ?",
      [application.id]
    );

    res.status(200).json({
      message: "Application status retrieved successfully",
      success: true,
      hasApplication: true,
      data: {
        applicationId: application.application_id,
        accountType: application.account_type,
        status: application.status,
        rejectionReason: application.rejection_reason,
        submittedAt: application.created_at,
        updatedAt: application.updated_at,
        reviewedAt: application.reviewed_at,
        storeName: application.store_name,
        storeDescription: application.store_description,
        businessDetails,
        address: addresses[0] || null,
        documents: documents || [],
      },
    });
  } catch (error) {
    console.error("Error fetching application status:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching application status.",
      success: false,
      error: {
        code: "FETCH_ERROR",
      },
    });
  }
};

module.exports = getApplicationStatus;
