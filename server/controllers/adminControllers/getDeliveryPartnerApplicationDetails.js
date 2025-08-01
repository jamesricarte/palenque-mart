const db = require("../../config/db");

const getDeliveryPartnerApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Get application details
    const [applications] = await db.execute(
      `
      SELECT 
        dpa.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.birth_date,
        u.gender,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name
      FROM delivery_partner_applications dpa
      JOIN users u ON dpa.user_id = u.id
      LEFT JOIN users reviewer ON dpa.reviewed_by = reviewer.id
      WHERE dpa.application_id = ?
    `,
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

    // Parse JSON fields safely
    try {
      application.service_areas = application.service_areas
        ? JSON.parse(application.service_areas)
        : [];
      application.availability_hours = application.availability_hours
        ? JSON.parse(application.availability_hours)
        : {};
    } catch (parseError) {
      console.error("Error parsing JSON fields:", parseError);
      application.service_areas = [];
      application.availability_hours = {};
    }

    // Get documents
    const [documents] = await db.execute(
      "SELECT * FROM delivery_partner_documents WHERE application_id = ?",
      [application.id]
    );

    res.status(200).json({
      message: "Application details retrieved successfully",
      success: true,
      data: {
        application,
        documents,
      },
    });
  } catch (error) {
    console.error("Error fetching application details:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching application details.",
      success: false,
      error: { code: "FETCH_ERROR" },
    });
  }
};

module.exports = getDeliveryPartnerApplicationDetails;
