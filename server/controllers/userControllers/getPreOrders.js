const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getPreOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = "all", limit = 20, offset = 0 } = req.query;

    let statusCondition = "";
    const queryParams = [userId];

    if (status !== "all") {
      statusCondition = "AND pi.status = ?";
      queryParams.push(status);
    }

    const query = `
      SELECT 
        o.id,
        o.order_number,
        o.status as order_status,
        o.total_amount,
        o.created_at,
        o.order_type,
        s.store_name,
        s.store_logo_key,
        pi.status as preorder_status,
        pi.expected_availability_date,
        pi.deposit_amount,
        pi.remaining_balance,
        pi.availability_notified_at,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        p.id as product_id,
        p.name as product_name,
        p.image_keys as product_image_keys,
        p.unit_type,
        COUNT(*) OVER() as total_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN preorder_items pi ON oi.id = pi.order_item_id
      JOIN products p ON oi.product_id = p.id
      JOIN sellers s ON o.seller_id = s.id
      WHERE o.user_id = ? ${statusCondition}
      ORDER BY o.created_at DESC
      LIMIT ${Number.parseInt(limit)} OFFSET ${Number.parseInt(offset)}
    `;

    const [results] = await db.execute(query, queryParams);

    // Group results by order
    const ordersMap = new Map();

    for (const row of results) {
      const orderId = row.id;

      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.id,
          order_number: row.order_number,
          order_status: row.order_status,
          total_amount: row.total_amount,
          created_at: row.created_at,
          order_type: row.order_type,
          store_name: row.store_name,
          store_logo_key: row.store_logo_key,
          store_logo_url: null,
          items: [],
        });
      }

      // Generate product image URL
      let productImageUrl = null;
      if (row.product_image_keys) {
        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(row.product_image_keys);
        productImageUrl = data?.publicUrl || null;
      }

      ordersMap.get(orderId).items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        product_image_url: productImageUrl,
        unit_type: row.unit_type,
        quantity: row.quantity,
        unit_price: row.unit_price,
        total_price: row.total_price,
        preorder_status: row.preorder_status,
        expected_availability_date: row.expected_availability_date,
        deposit_amount: row.deposit_amount,
        remaining_balance: row.remaining_balance,
        availability_notified_at: row.availability_notified_at,
      });
    }

    // Generate store logo URLs
    const orders = Array.from(ordersMap.values());
    for (const order of orders) {
      if (order.store_logo_key) {
        const { data } = supabase.storage
          .from("vendor-assets")
          .getPublicUrl(order.store_logo_key);
        order.store_logo_url = data?.publicUrl || null;
      }
    }

    const totalCount = results.length > 0 ? results[0].total_count : 0;

    res.status(200).json({
      success: true,
      message: "Pre-orders fetched successfully",
      data: {
        orders: orders,
        pagination: {
          total: totalCount,
          limit: Number.parseInt(limit),
          offset: Number.parseInt(offset),
          hasMore: Number.parseInt(offset) + orders.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching pre-orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pre-orders",
      error: error.message,
    });
  }
};

module.exports = getPreOrders;
