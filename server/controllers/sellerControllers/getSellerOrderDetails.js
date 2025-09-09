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
        v.discount_value,
        s.application_id as seller_application_id
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.user_id = u.id
      JOIN sellers s ON oi.seller_id = s.id
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

    let itemsQuery = `SELECT 
        oi.*,
        p.name as product_name,
        p.image_keys,
        p.unit_type,
        p.description as product_description`;

    if (order.order_type === "preorder") {
      itemsQuery += `,
        pi.expected_availability_date,
        pi.deposit_amount,
        pi.remaining_balance as preorder_remaining_balance,
        pi.status as preorder_status,
        pi.availability_notified_at
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN preorder_items pi ON oi.id = pi.order_item_id`;
    } else {
      itemsQuery += `,
        p.is_preorder_enabled,
        p.expected_availability_date
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id`;
    }

    itemsQuery += `
      WHERE oi.order_id = ? AND oi.seller_id = ?
      ORDER BY oi.created_at`;

    const [items] = await db.execute(itemsQuery, [orderId, sellerId]);

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

    // Get delivery partner information if order has delivery assignment
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
          dp.id,
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
          deliveryPartner = {
            id: assignment.id,
            partner_id: assignment.partner_id,
            first_name: assignment.partner_first_name,
            last_name: assignment.partner_last_name,
            phone: assignment.partner_phone,
            vehicle_type: assignment.vehicle_type,
            rating: assignment.rating,
            profile_picture: assignment.profile_picture,
            location: {
              latitude: assignment.delivery_partner_latitude,
              longitude: assignment.delivery_partner_longitude,
            },
          };
        }
      }

      // Get seller pickup coordinates
      const [pickupRows] = await db.execute(
        `SELECT latitude, longitude 
         FROM seller_addresses 
         WHERE application_id = ? AND type = 'pickup'`,
        [order.seller_application_id]
      );

      if (pickupRows.length > 0) {
        pickupCoordinates = {
          latitude: Number.parseFloat(pickupRows[0].latitude),
          longitude: Number.parseFloat(pickupRows[0].longitude),
        };
      }

      // Get delivery coordinates
      if (order.delivery_address_id) {
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

      // Fallback to order coordinates if user address not found
      if (
        !deliveryCoordinates &&
        order.delivery_latitude &&
        order.delivery_longitude
      ) {
        deliveryCoordinates = {
          latitude: Number.parseFloat(order.delivery_latitude),
          longitude: Number.parseFloat(order.delivery_longitude),
        };
      }
    }

    const orderResponse = {
      ...order,
      items: itemsWithImages,
      statusHistory,
      seller_total_amount: sellerTotal,
      delivery_partner: deliveryPartner,
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
    console.error("Error fetching seller order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: { code: "FETCH_ORDER_DETAILS_ERROR", details: error.message },
    });
  }
};

module.exports = getSellerOrderDetails;
