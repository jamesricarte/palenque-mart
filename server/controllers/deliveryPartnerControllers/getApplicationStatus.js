const db = require("../../config/db")

const getApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id

    // Get the most recent application for this user
    const [applications] = await db.execute(
      `SELECT dpa.*, 
              CASE 
                WHEN dpa.status = 'approved' THEN 'approved'
                ELSE dpa.status 
              END as status
       FROM delivery_partner_applications dpa 
       WHERE dpa.user_id = ? 
       ORDER BY dpa.created_at DESC 
       LIMIT 1`,
      [userId],
    )

    if (applications.length === 0) {
      return res.status(404).json({
        message: "No delivery partner application found",
        success: false,
        hasApplication: false,
      })
    }

    const application = applications[0]

    // Get documents for this application
    const [documents] = await db.execute(
      `SELECT document_type, verification_status, rejection_reason 
       FROM delivery_partner_documents 
       WHERE application_id = ?`,
      [application.id],
    )

    // Parse JSON fields
    let serviceAreas = []
    let availabilityHours = {}

    try {
      serviceAreas = JSON.parse(application.service_areas || "[]")
      availabilityHours = JSON.parse(application.availability_hours || "{}")
    } catch (e) {
      console.error("Error parsing JSON fields:", e)
    }

    const responseData = {
      applicationId: application.application_id,
      status: application.status,
      vehicleType: application.vehicle_type,
      licenseNumber: application.license_number,
      vehicleRegistration: application.vehicle_registration,
      companyName: application.company_name,
      serviceAreas,
      availabilityHours,
      emergencyContactName: application.emergency_contact_name,
      emergencyContactPhone: application.emergency_contact_phone,
      submittedAt: application.created_at,
      reviewedAt: application.reviewed_at,
      rejectionReason: application.rejection_reason,
      documents: documents,
    }

    res.status(200).json({
      message: "Application status retrieved successfully",
      success: true,
      hasApplication: true,
      data: responseData,
    })
  } catch (error) {
    console.error("Error fetching delivery partner application status:", error)
    res.status(500).json({
      message: "Failed to fetch application status",
      success: false,
      error: { code: "FETCH_ERROR" },
    })
  }
}

module.exports = getApplicationStatus
