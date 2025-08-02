const db = require("../../config/db");

const getDeliveryHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

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

    const deliveryPartnerId = deliveryPartners[0].id;

    // Build query based on status filter
    let statusCondition = "";
    const queryParams = [deliveryPartnerId];

    if (status && status !== "all") {
      statusCondition = "AND da.status = ?";
      queryParams.push(status);
    }

    // Get delivery history
    const [deliveryHistory] = await db.execute(
      `SELECT 
        da.id as assignment_id,
        da.order_id,
        da.status,
        da.delivery_fee,
        da.assigned_at,
        da.pickup_time,
        da.delivery_time,
        da.pickup_address,
        da.delivery_address,
        o.order_number,
        o.total_amount,
        o.delivery_recipient_name,
        o.delivery_phone_number,
        o.delivery_street_address,
        o.delivery_barangay,
        o.delivery_city,
        COUNT(oi.id) as item_count
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      JOIN order_items oi ON o.id = oi.order_id
      WHERE da.delivery_partner_id = ? ${statusCondition}
      GROUP BY da.id, da.order_id, da.status, da.delivery_fee, da.assigned_at,
               da.pickup_time, da.delivery_time, da.pickup_address, da.delivery_address,
               o.order_number, o.total_amount, o.delivery_recipient_name,
               o.delivery_phone_number, o.delivery_street_address, o.delivery_barangay, o.delivery_city
      ORDER BY da.assigned_at DESC
      LIMIT ${Number.parseInt(limit)} OFFSET ${Number.parseInt(offset)}`,
      queryParams
    );

    // Get total count for pagination
    const countParams = [deliveryPartnerId];
    if (status && status !== "all") {
      countParams.push(status);
    }

    const [totalCount] = await db.execute(
      `SELECT COUNT(DISTINCT da.id) as total 
       FROM delivery_assignments da
       WHERE da.delivery_partner_id = ? ${statusCondition}`,
      countParams
    );

    const total = totalCount[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Delivery history retrieved successfully",
      success: true,
      data: {
        deliveries: deliveryHistory,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching delivery history:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = getDeliveryHistory;
