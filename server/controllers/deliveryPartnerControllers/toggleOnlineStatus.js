const db = require("../../config/db")

const toggleOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const { is_online, current_location_lat, current_location_lng } = req.body

    // Get delivery partner
    const [deliveryPartners] = await db.execute(
      "SELECT id, is_online FROM delivery_partners WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
      [userId],
    )

    if (deliveryPartners.length === 0) {
      return res.status(404).json({
        message: "Delivery partner profile not found",
        success: false,
        error: { code: "PROFILE_NOT_FOUND" },
      })
    }

    const partnerId = deliveryPartners[0].id

    // Update online status and location
    await db.execute(
      `UPDATE delivery_partners SET 
        is_online = ?,
        current_location_lat = ?,
        current_location_lng = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [is_online ? 1 : 0, current_location_lat, current_location_lng, partnerId],
    )

    res.status(200).json({
      message: `Status updated to ${is_online ? "online" : "offline"}`,
      success: true,
      data: {
        is_online: is_online,
      },
    })
  } catch (error) {
    console.error("Error updating online status:", error)
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    })
  }
}

module.exports = toggleOnlineStatus
