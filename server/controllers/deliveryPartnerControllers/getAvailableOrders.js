const db = require("../../config/db");

const getAvailableOrders = async (req, res) => {
  try {
    const userId = req.user.id;

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

    // Get available orders (orders ready for pickup without assigned delivery partner)
    const [availableOrders] = await db.execute(
      `SELECT 
        da.id as assignment_id,
        da.order_id,
        da.delivery_fee,
        da.pickup_address,
        da.delivery_address,
        da.special_instructions,
        da.created_at as assignment_created,
        o.order_number,
        o.total_amount,
        o.delivery_recipient_name,
        o.delivery_phone_number,
        o.delivery_street_address,
        o.delivery_barangay,
        o.delivery_city,
        o.delivery_province,
        o.delivery_landmark,
        o.delivery_notes,
        COUNT(oi.id) as item_count
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      JOIN order_items oi ON o.id = oi.order_id
      WHERE da.status = 'looking_for_rider'
      AND da.delivery_partner_id IS NULL
      GROUP BY da.id, da.order_id, da.delivery_fee, da.pickup_address, da.delivery_address, 
               da.special_instructions, da.created_at, o.order_number, o.total_amount,
               o.delivery_recipient_name, o.delivery_phone_number, o.delivery_street_address,
               o.delivery_barangay, o.delivery_city, o.delivery_province, o.delivery_landmark, o.delivery_notes
      ORDER BY da.created_at ASC`,
      []
    );

    res.status(200).json({
      message: "Available orders retrieved successfully",
      success: true,
      data: availableOrders,
    });
  } catch (error) {
    console.error("Error fetching available orders:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = getAvailableOrders;
