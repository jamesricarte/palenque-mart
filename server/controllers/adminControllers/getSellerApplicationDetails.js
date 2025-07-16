const db = require("../../config/db")

const getSellerApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params

    // Get application details
    const [applications] = await db.execute(
      `
      SELECT 
        sa.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.birth_date,
        u.gender,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name
      FROM seller_applications sa
      JOIN users u ON sa.user_id = u.id
      LEFT JOIN users reviewer ON sa.reviewed_by = reviewer.id
      WHERE sa.application_id = ?
    `,
      [applicationId],
    )

    if (applications.length === 0) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
        error: { code: "NOT_FOUND" },
      })
    }

    const application = applications[0]

    // Get business details if business account
    let businessDetails = null
    if (application.account_type === "business") {
      const [business] = await db.execute("SELECT * FROM seller_business_details WHERE application_id = ?", [
        application.id,
      ])
      businessDetails = business[0] || null
    }

    // Get address details
    const [addresses] = await db.execute("SELECT * FROM seller_addresses WHERE application_id = ?", [application.id])

    // Get store profile
    const [storeProfiles] = await db.execute("SELECT * FROM seller_store_profiles WHERE application_id = ?", [
      application.id,
    ])

    // Get documents
    const [documents] = await db.execute("SELECT * FROM seller_documents WHERE application_id = ?", [application.id])

    res.status(200).json({
      message: "Application details retrieved successfully",
      success: true,
      data: {
        application,
        businessDetails,
        address: addresses[0] || null,
        storeProfile: storeProfiles[0] || null,
        documents,
      },
    })
  } catch (error) {
    console.error("Error fetching application details:", error)
    return res.status(500).json({
      message: "Something went wrong while fetching application details.",
      success: false,
      error: { code: "FETCH_ERROR" },
    })
  }
}

module.exports = getSellerApplicationDetails
