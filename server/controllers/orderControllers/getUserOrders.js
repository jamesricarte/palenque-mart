const db = require("../../config/db");

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let statusFilter = "";
    let queryParams = [userId];

    if (status && status !== "all") {
      statusFilter = "AND o.status = ?";
      queryParams.push(status);
    }

    // Dont parametize limit and offset since MySQL itself sometimes rejects LIMIT and OFFSET placeholders in prepared statements
    const [orders] = await db.execute(
      `SELECT 
        o.*,
        ua.recipient_name,
        ua.phone_number,
        ua.street_address,
        ua.barangay,
        ua.city,
        ua.province,
        ua.landmark,
        v.code as voucher_code,
        v.title as voucher_title,
        COUNT(oi.id) as item_count,
        GROUP_CONCAT(DISTINCT s.store_name) as store_names
      FROM orders o
      LEFT JOIN user_addresses ua ON o.delivery_address_id = ua.id
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN sellers s ON oi.seller_id = s.id
      WHERE o.user_id = ? ${statusFilter}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      queryParams
    );

    if (statusFilter === "AND o.status = ?") {
    }

    const countStatusFilter = status !== "all" ? "AND status = ?" : "";

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM orders WHERE user_id = ? ${countStatusFilter}`,
      status && status !== "all" ? [userId, status] : [userId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

module.exports = getUserOrders;
