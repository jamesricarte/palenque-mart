const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let statusFilter = "";
    const queryParams = [userId];

    if (status && status !== "all") {
      statusFilter = "AND o.status = ?";
      queryParams.push(status);
    }

    // Get orders with first store logo
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
        GROUP_CONCAT(DISTINCT s.store_name) as store_names,
        (SELECT s2.store_logo_key 
         FROM order_items oi2 
         JOIN sellers s2 ON oi2.seller_id = s2.id 
         WHERE oi2.order_id = o.id 
         LIMIT 1) as first_store_logo_key
      FROM orders o
      LEFT JOIN user_addresses ua ON o.delivery_address_id = ua.id
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN sellers s ON oi.seller_id = s.id
      WHERE o.user_id = ? ${statusFilter}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      queryParams
    );

    // Generate public URLs for store logos
    const ordersWithLogos = orders.map((order) => {
      let store_logo_url = null;

      if (order.first_store_logo_key) {
        const { data } = supabase.storage
          .from("vendor-assets")
          .getPublicUrl(order.first_store_logo_key);

        store_logo_url = data.publicUrl;
      }

      return {
        ...order,
        store_logo_url,
      };
    });

    const totalCountStatusFilter =
      statusFilter === "AND o.status = ?" ? "AND status = ?" : "";

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM orders WHERE user_id = ? ${totalCountStatusFilter}`,
      status && status !== "all" ? [userId, status] : [userId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders: ordersWithLogos,
        pagination: {
          currentPage: Number.parseInt(page),
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
