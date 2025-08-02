const db = require("../../config/db");

const updateDeliveryPartnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      vehicle_make,
      vehicle_model,
      vehicle_year,
      vehicle_color,
      company_name,
      service_areas,
      availability_hours,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
    } = req.body;

    // Get current delivery partner
    const [currentPartner] = await db.execute(
      "SELECT * FROM delivery_partners WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (currentPartner.length === 0) {
      return res.status(404).json({
        message: "Delivery partner profile not found",
        success: false,
        error: { code: "PROFILE_NOT_FOUND" },
      });
    }

    const partnerId = currentPartner[0].id;

    // Update delivery partner profile
    await db.execute(
      `UPDATE delivery_partners SET 
        vehicle_make = ?,
        vehicle_model = ?,
        vehicle_year = ?,
        vehicle_color = ?,
        company_name = ?,
        service_areas = ?,
        availability_hours = ?,
        emergency_contact_name = ?,
        emergency_contact_phone = ?,
        emergency_contact_relation = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_color,
        company_name,
        JSON.stringify(service_areas || []),
        JSON.stringify(availability_hours || {}),
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relation,
        partnerId,
      ]
    );

    console.log("Delivery partner profile updated successfully");

    res.status(200).json({
      message: "Delivery partner profile updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating delivery partner profile:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = updateDeliveryPartnerProfile;
