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

    // Get orders with first store logo - now using stored delivery address fields
    const [orders] = await db.execute(
      `SELECT 
        o.*,
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
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN sellers s ON oi.seller_id = s.id
      WHERE o.user_id = ? ${statusFilter}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      queryParams
    );

    // Generate public URLs for store logos and map delivery address fields
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
        // Map stored delivery fields to expected field names for backward compatibility
        recipient_name: order.delivery_recipient_name,
        phone_number: order.delivery_phone_number,
        street_address: order.delivery_street_address,
        barangay: order.delivery_barangay,
        city: order.delivery_city,
        province: order.delivery_province,
        landmark: order.delivery_landmark,
        store_logo_url,
      };
    });

    // Do not remove this line because it is essential for making the query of countResult correct
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
