const db = require("../../config/db");

const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
        success: false,
        error: { code: "MISSING_COORDINATES" },
      });
    }

    // Get delivery partner ID
    const [deliveryPartners] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (deliveryPartners.length === 0) {
      return res.status(404).json({
        message: "Delivery partner profile not found",
        success: false,
        error: { code: "PROFILE_NOT_FOUND" },
      });
    }

    const partnerId = deliveryPartners[0].id;

    // Update delivery partner location in database
    await db.execute(
      "UPDATE delivery_partners SET current_location_lat = ?, current_location_lng = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [latitude, longitude, partnerId]
    );

    res.status(200).json({
      message: "Location updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating delivery partner location:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = updateLocation;
