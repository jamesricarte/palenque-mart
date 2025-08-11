const db = require("../../config/db");

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
};

const createDeliveryAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
        success: false,
        error: { code: "MISSING_REQUIRED_FIELDS" },
      });
    }

    const [sellerApplicationRows] = await db.execute(
      "SELECT application_id FROM sellers WHERE user_id = ?",
      [userId]
    );

    if (sellerApplicationRows.length === 0) {
      return res.status(404).json({
        message: "Seller application not found",
        success: false,
        error: { code: "SELLER_APPLICATION_NOT_FOUND" },
      });
    }

    const sellerApplicationId = sellerApplicationRows[0].application_id;

    const [pickupAddressRows] = await db.execute(
      "SELECT * FROM seller_addresses WHERE application_id = ? AND type = 'pickup'",
      [sellerApplicationId]
    );

    if (pickupAddressRows.length === 0) {
      return res.status(404).json({
        message: "Seller pick up adress is not set",
        success: false,
        error: { code: "NULL_SELLER_PICKUP_ADDRESS" },
      });
    }

    const pickupAddress = pickupAddressRows[0];

    // Verify the order belongs to this seller
    const [orderCheck] = await db.execute(
      `SELECT o.id, o.order_number, o.delivery_street_address, o.delivery_barangay, 
              o.delivery_city, o.delivery_province, o.delivery_postal_code, 
              o.delivery_landmark, o.delivery_recipient_name, o.delivery_phone_number,
              o.total_amount
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       JOIN sellers s ON p.seller_id = s.id
       WHERE o.id = ? AND o.status = 'ready_for_pickup'
       LIMIT 1`,
      [orderId]
    );

    if (orderCheck.length === 0) {
      return res.status(404).json({
        message: "Order not found or not ready for pickup",
        success: false,
        error: { code: "ORDER_NOT_FOUND" },
      });
    }

    const order = orderCheck[0];

    // Check if delivery assignment already exists
    const [existingAssignment] = await db.execute(
      "SELECT id FROM delivery_assignments WHERE order_id = ?",
      [orderId]
    );

    if (existingAssignment.length > 0) {
      return res.status(400).json({
        message: "Delivery assignment already exists for this order",
        success: false,
        error: { code: "ASSIGNMENT_EXISTS" },
      });
    }

    // Create delivery address string
    const deliveryAddress = `${order.delivery_street_address}, ${
      order.delivery_barangay
    }, ${order.delivery_city}, ${order.delivery_province} ${
      order.delivery_postal_code
    }${order.delivery_landmark ? `, ${order.delivery_landmark}` : ""}`;

    // Create pickup address string
    const pickupAddressString = `${pickupAddress.street_address}, ${
      pickupAddress.barangay
    }, ${pickupAddress.city}, ${pickupAddress.province} ${
      pickupAddress.postal_code
    }${pickupAddress.landmark ? `, ${pickupAddress.landmark}` : ""}`;

    // Create delivery assignment
    const [assignmentResult] = await db.execute(
      `INSERT INTO delivery_assignments (order_id, status, delivery_fee, pickup_address, delivery_address, created_at)
       VALUES (?, 'looking_for_rider', 50.00, ?, ?, CURRENT_TIMESTAMP)`,
      [orderId, pickupAddressString, deliveryAddress]
    );

    const assignmentId = assignmentResult.insertId;

    // Get online delivery partners with their locations
    const [availablePartners] = await db.execute(
      `SELECT dp.id, dp.partner_id, dp.current_location_lat, dp.current_location_lng, 
              u.first_name, u.last_name, dp.rating
       FROM delivery_partners dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.is_online = 1 AND dp.is_active = 1
       AND dp.current_location_lat IS NOT NULL AND dp.current_location_lng IS NOT NULL`,
      []
    );

    if (availablePartners.length === 0) {
      return res.status(200).json({
        message:
          "Delivery assignment created but no available delivery partners found",
        success: true,
        data: { assignmentId, nearestPartners: [] },
      });
    }

    // Calculate distances and get top 5 nearest partners
    const partnersWithDistance = availablePartners.map((partner) => ({
      ...partner,
      distance: calculateDistance(
        parseFloat(pickupAddress.latitude),
        parseFloat(pickupAddress.longitude),
        parseFloat(partner.current_location_lat),
        parseFloat(partner.current_location_lng)
      ),
    }));

    // Sort by distance and get top 5
    const nearestPartners = partnersWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    console.log("nearestPartners:", nearestPartners);

    // Store candidates in delivery_candidates table
    const candidateInserts = nearestPartners.map((partner) => [
      assignmentId,
      partner.id,
      partner.distance,
      "pending",
    ]);

    if (candidateInserts.length > 0) {
      await db.execute(
        `INSERT INTO delivery_candidates (assignment_id, delivery_partner_id, distance, status) VALUES ${candidateInserts
          .map(() => "(?, ?, ?, ?)")
          .join(", ")}`,
        candidateInserts.flat()
      );
    }

    // Notify all tracked delivery partners via WebSocket to refresh their orders
    const deliveryPartners = req.app.get("deliveryPartners");

    const refreshNotification = {
      type: "REFRESH_DELIVERY_PARTNER_ORDERS",
      message: "New delivery opportunities available",
    };

    nearestPartners.forEach((partner) => {
      const partnerData = deliveryPartners.get(partner.id);
      if (
        partnerData &&
        partnerData.socket &&
        partnerData.socket.readyState === 1
      ) {
        partnerData.socket.send(JSON.stringify(refreshNotification));
        console.log(`Sent refresh notification to partner id: ${partner.id}`);
      }
    });

    res.status(201).json({
      message: "Delivery assignment created and candidates notified",
      success: true,
      data: {
        assignmentId,
        nearestPartners: nearestPartners.map((p) => ({
          partnerId: p.partner_id,
          name: `${p.first_name} ${p.last_name}`,
          distance: p.distance,
          rating: p.rating,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating delivery assignment:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = createDeliveryAssignment;
