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
        s.store_logo_key,
        s.application_id as seller_application_id
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

    let deliveryPartner = null;
    let deliveryAssignment = null;
    let pickupCoordinates = null;
    let deliveryCoordinates = null;

    if (
      [
        "rider_assigned",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ].includes(order.status)
    ) {
      // Get delivery assignment and partner info
      const [assignmentRows] = await db.execute(
        `SELECT 
          da.*,
          dp.id as delivery_partner_id,
          dp.partner_id,
          dp.vehicle_type,
          dp.rating,
          dp.profile_picture,
          dp.current_location_lat as delivery_partner_latitude,
          dp.current_location_lng as delivery_partner_longitude,
          u.first_name as partner_first_name,
          u.last_name as partner_last_name,
          u.phone as partner_phone
        FROM delivery_assignments da
        LEFT JOIN delivery_partners dp ON da.delivery_partner_id = dp.id
        LEFT JOIN users u ON dp.user_id = u.id
        WHERE da.order_id = ?`,
        [orderId]
      );

      if (assignmentRows.length > 0) {
        const assignment = assignmentRows[0];
        deliveryAssignment = {
          id: assignment.id,
          status: assignment.status,
          assigned_at: assignment.assigned_at,
          pickup_time: assignment.pickup_time,
          delivery_time: assignment.delivery_time,
          delivery_fee: assignment.delivery_fee,
        };

        if (assignment.delivery_partner_id) {
          let profile_picture_url = null;

          // Generate delivery partner profile picture URL
          if (assignment.profile_picture) {
            const { data } = supabase.storage
              .from("delivery-partner-assets")
              .getPublicUrl(assignment.profile_picture);
            profile_picture_url = data.publicUrl;
          }

          deliveryPartner = {
            id: assignment.delivery_partner_id,
            partner_id: assignment.partner_id,
            first_name: assignment.partner_first_name,
            last_name: assignment.partner_last_name,
            phone_number: assignment.partner_phone,
            vehicle_type: assignment.vehicle_type,
            rating: assignment.rating,
            profile_picture_key: profile_picture_url,
            location: {
              latitude: assignment.delivery_partner_latitude,
              longitude: assignment.delivery_partner_longitude,
            },
          };
        }
      }

      // Get seller pickup coordinates if items exist
      if (items.length > 0) {
        const [pickupRows] = await db.execute(
          `SELECT latitude, longitude 
           FROM seller_addresses 
           WHERE application_id = ? AND type = 'pickup'`,
          [items[0].seller_application_id]
        );

        if (pickupRows.length > 0) {
          pickupCoordinates = {
            latitude: Number.parseFloat(pickupRows[0].latitude),
            longitude: Number.parseFloat(pickupRows[0].longitude),
          };
        }
      }

      // Get delivery coordinates from order
      if (order.delivery_latitude && order.delivery_longitude) {
        deliveryCoordinates = {
          latitude: Number.parseFloat(order.delivery_latitude),
          longitude: Number.parseFloat(order.delivery_longitude),
        };
      } else {
        const [deliveryAddressRows] = await db.execute(
          `SELECT latitude, longitude 
           FROM user_addresses 
           WHERE id = ?`,
          [order.delivery_address_id]
        );

        if (deliveryAddressRows.length > 0) {
          deliveryCoordinates = {
            latitude: Number.parseFloat(deliveryAddressRows[0].latitude),
            longitude: Number.parseFloat(deliveryAddressRows[0].longitude),
          };
        }
      }
    }

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
      deliveryPartner,
      delivery_assignment: deliveryAssignment,
      pickup_coordinates: pickupCoordinates,
      delivery_coordinates: deliveryCoordinates,
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
