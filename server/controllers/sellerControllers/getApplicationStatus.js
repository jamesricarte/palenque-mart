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

    // Get address details with new structure
    const [addresses] = await db.execute(
      "SELECT type, street_address, barangay, city, province, postal_code, landmark, latitude, longitude FROM seller_addresses WHERE application_id = ?",
      [application.id]
    );

    // Transform addresses into object-based structure
    const addressData = {
      pickup_address: {},
      return_address: {},
      store_location: {},
    };

    addresses.forEach((addr) => {
      const addressKey =
        addr.type === "pickup"
          ? "pickup_address"
          : addr.type === "return"
          ? "return_address"
          : "store_location";

      addressData[addressKey] = {
        street_address: addr.street_address,
        barangay: addr.barangay,
        city: addr.city,
        province: addr.province,
        postal_code: addr.postal_code,
        landmark: addr.landmark,
        latitude: addr.latitude,
        longitude: addr.longitude,
      };
    });

    // Get document status
    const [documents] = await db.execute(
      "SELECT id, document_type, verification_status, rejection_reason FROM seller_documents WHERE application_id = ?",
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
        address: addressData,
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
