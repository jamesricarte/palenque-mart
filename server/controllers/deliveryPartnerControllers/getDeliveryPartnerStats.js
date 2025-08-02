const db = require("../../config/db")

const getDeliveryPartnerStats = async (req, res) => {
  try {
    const userId = req.user.id

    // Get delivery partner ID
    const [deliveryPartners] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
      [userId],
    )

    if (deliveryPartners.length === 0) {
      return res.status(404).json({
        message: "Delivery partner profile not found",
        success: false,
        error: { code: "PROFILE_NOT_FOUND" },
      })
    }

    const deliveryPartnerId = deliveryPartners[0].id

    // Get total deliveries
    const [totalDeliveries] = await db.execute(
      "SELECT COUNT(*) as total FROM delivery_assignments WHERE delivery_partner_id = ? AND status = 'delivered'",
      [deliveryPartnerId],
    )

    // Get deliveries this month
    const [monthlyDeliveries] = await db.execute(
      `SELECT COUNT(*) as total FROM delivery_assignments 
       WHERE delivery_partner_id = ? AND status = 'delivered' 
       AND MONTH(delivery_time) = MONTH(CURRENT_DATE()) 
       AND YEAR(delivery_time) = YEAR(CURRENT_DATE())`,
      [deliveryPartnerId],
    )

    // Get total earnings (sum of delivery fees)
    const [totalEarnings] = await db.execute(
      "SELECT COALESCE(SUM(delivery_fee), 0) as total FROM delivery_assignments WHERE delivery_partner_id = ? AND status = 'delivered'",
      [deliveryPartnerId],
    )

    // Get earnings this month
    const [monthlyEarnings] = await db.execute(
      `SELECT COALESCE(SUM(delivery_fee), 0) as total FROM delivery_assignments 
       WHERE delivery_partner_id = ? AND status = 'delivered'
       AND MONTH(delivery_time) = MONTH(CURRENT_DATE()) 
       AND YEAR(delivery_time) = YEAR(CURRENT_DATE())`,
      [deliveryPartnerId],
    )

    // Get current rating
    const [partnerInfo] = await db.execute(
      "SELECT rating, total_deliveries, is_online FROM delivery_partners WHERE id = ?",
      [deliveryPartnerId],
    )

    const stats = {
      totalDeliveries: totalDeliveries[0].total,
      monthlyDeliveries: monthlyDeliveries[0].total,
      totalEarnings: Number.parseFloat(totalEarnings[0].total),
      monthlyEarnings: Number.parseFloat(monthlyEarnings[0].total),
      rating: Number.parseFloat(partnerInfo[0].rating),
      isOnline: partnerInfo[0].is_online === 1,
    }

    res.status(200).json({
      message: "Delivery partner stats retrieved successfully",
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching delivery partner stats:", error)
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    })
  }
}

module.exports = getDeliveryPartnerStats
