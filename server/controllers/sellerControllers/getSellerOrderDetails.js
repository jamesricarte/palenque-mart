const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getSellerOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // First, get the seller_id for this user
    const [sellerRows] = await db.execute(
      "SELECT id FROM sellers WHERE user_id = ? AND is_active = 1",
      [userId]
    );

    if (sellerRows.length === 0) {
      return res.status(404).json({
        message: "Seller profile not found.",
        success: false,
        error: { code: "SELLER_NOT_FOUND" },
      });
    }

    const sellerId = sellerRows[0].id;

    // Get order details
    const [orderRows] = await db.execute(
      `SELECT DISTINCT
        o.*,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone as customer_phone,
        v.code as voucher_code,
        v.title as voucher_title,
        v.discount_type,
        v.discount_value
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.user_id = u.id
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      WHERE o.id = ? AND oi.seller_id = ?`,
      [orderId, sellerId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission to view it",
        error: { code: "ORDER_NOT_FOUND" },
      });
    }

    const order = orderRows[0];

    // Get order items for this seller only
    const [items] = await db.execute(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image_keys,
        p.unit_type,
        p.description as product_description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ? AND oi.seller_id = ?
      ORDER BY oi.created_at`,
      [orderId, sellerId]
    );

    // Generate public URLs for product images
    const itemsWithImages = items.map((item) => {
      let productImageUrl = null;

      if (item.image_keys) {
        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(item.image_keys);
        productImageUrl = data.publicUrl;
      }

      return {
        ...item,
        image_keys: productImageUrl,
      };
    });

    // Get status history
    const [statusHistory] = await db.execute(
      `SELECT 
        osh.*,
        u.first_name,
        u.last_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.updated_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at DESC`,
      [orderId]
    );

    // Calculate seller's portion of the order
    const sellerTotal = items.reduce(
      (sum, item) => sum + Number.parseFloat(item.total_price),
      0
    );

    const orderResponse = {
      ...order,
      items: itemsWithImages,
      statusHistory,
      seller_total_amount: sellerTotal,
    };

    res.json({
      success: true,
      data: {
        order: orderResponse,
      },
    });
  } catch (error) {
    console.error("Error fetching seller order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: { code: "FETCH_ORDER_DETAILS_ERROR", details: error.message },
    });
  }
};

module.exports = getSellerOrderDetails;
