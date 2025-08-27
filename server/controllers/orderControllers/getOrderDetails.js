const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Get order details - now using stored delivery address fields
    const [orderRows] = await db.execute(
      `SELECT 
        o.*,
        v.code as voucher_code,
        v.title as voucher_title,
        v.discount_type,
        v.discount_value
      FROM orders o
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderRows[0];

    // Get order items
    const [items] = await db.execute(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image_keys,
        p.unit_type,
        s.seller_id as seller_seller_id,
        s.store_name,
        s.store_logo_key
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN sellers s ON oi.seller_id = s.id
      WHERE oi.order_id = ?
      ORDER BY oi.created_at`,
      [orderId]
    );

    let orderProductReview = null;
    let orderSellerReview = null;

    if (items.length > 0) {
      const [orderProductReviewRows] = await db.execute(
        `SELECT pr.*, rm.storage_key, rm.media_type, rm.file_name
         FROM product_reviews pr
         LEFT JOIN review_media rm ON pr.id = rm.review_id AND rm.review_type = 'product'
         WHERE pr.user_id = ? AND pr.order_id = ?`,
        [userId, orderId]
      );

      const [orderSellerReviewRows] = await db.execute(
        `SELECT * FROM seller_reviews 
         WHERE user_id = ? AND seller_id = ? AND order_id = ?`,
        [userId, items[0].seller_id, orderId]
      );

      if (orderProductReviewRows.length > 0) {
        orderProductReview = orderProductReviewRows[0];
      }

      if (orderSellerReviewRows.length > 0) {
        orderSellerReview = orderSellerReviewRows[0];
      }
    }

    // Generate public URLs for images
    const itemsWithImages = items.map((item) => {
      let productImageUrl = null;
      let storeLogoUrl = null;

      // Generate product image URL
      if (item.image_keys) {
        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(item.image_keys);
        productImageUrl = data.publicUrl;
      }

      // Generate store logo URL
      if (item.store_logo_key) {
        const { data } = supabase.storage
          .from("vendor-assets")
          .getPublicUrl(item.store_logo_key);
        storeLogoUrl = data.publicUrl;
      }

      return {
        ...item,
        image_keys: productImageUrl,
        store_logo_key: storeLogoUrl,
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

    // Format the order response with stored delivery address fields
    const orderResponse = {
      ...order,
      // Map stored delivery fields to expected field names for backward compatibility
      recipient_name: order.delivery_recipient_name,
      phone_number: order.delivery_phone_number,
      street_address: order.delivery_street_address,
      barangay: order.delivery_barangay,
      city: order.delivery_city,
      province: order.delivery_province,
      postal_code: order.delivery_postal_code,
      landmark: order.delivery_landmark,
      items: itemsWithImages,
      statusHistory,
      orderProductReview,
      orderSellerReview,
    };

    res.json({
      success: true,
      data: {
        order: orderResponse,
      },
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

module.exports = getOrderDetails;
