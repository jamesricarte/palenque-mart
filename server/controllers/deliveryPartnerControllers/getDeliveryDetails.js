const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getDeliveryDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
        success: false,
        error: { code: "MISSING_ASSIGNMENT_ID" },
      });
    }

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

    const partnerId = deliveryPartners[0].id;

    // Get delivery assignment details
    const [assignments] = await db.execute(
      `SELECT 
        da.id as assignment_id,
        da.order_id,
        da.status as delivery_status,
        da.delivery_partner_id,
        da.assigned_at,
        da.pickup_time,
        da.delivery_time,
        da.proof_of_delivery_image,
        da.estimated_delivery_time,
        da.delivery_fee,
        da.pickup_address,
        da.delivery_address,
        da.special_instructions,
        da.created_at as assignment_created,
        o.user_id,
        o.seller_id,
        o.order_number,
        o.status as order_status,
        o.payment_method,
        o.payment_status,
        o.subtotal,
        o.voucher_discount,
        o.total_amount,
        o.delivery_address_id,
        o.delivery_recipient_name,
        o.delivery_phone_number,
        o.delivery_street_address,
        o.delivery_barangay,
        o.delivery_city,
        o.delivery_province,
        o.delivery_postal_code,
        o.delivery_landmark,
        o.delivery_notes,
        o.estimated_delivery_time as order_estimated_delivery,
        o.created_at as order_created,
        s.store_name,
        s.store_logo_key,
        s.application_id, 
        dc.status as candidate_status,
        dc.distance
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      JOIN sellers s ON o.seller_id = s.id
      LEFT JOIN delivery_candidates dc ON da.id = dc.assignment_id AND dc.delivery_partner_id = ?
      WHERE da.id = ?`,
      [partnerId, assignmentId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        message: "Delivery assignment not found",
        success: false,
        error: { code: "ASSIGNMENT_NOT_FOUND" },
      });
    }

    const assignment = assignments[0];

    // Get seller's pickup address coordinates
    const [pickupAddresses] = await db.execute(
      `SELECT latitude, longitude 
       FROM seller_addresses 
       WHERE application_id = ? AND type = 'pickup'`,
      [assignment.application_id]
    );

    let pickupCoordinates = null;
    if (pickupAddresses.length > 0) {
      pickupCoordinates = {
        latitude: Number.parseFloat(pickupAddresses[0].latitude),
        longitude: Number.parseFloat(pickupAddresses[0].longitude),
      };
    }

    // Get delivery address coordinates
    let deliveryCoordinates = null;
    if (assignment.delivery_address_id) {
      const [deliveryAddresses] = await db.execute(
        `SELECT latitude, longitude 
         FROM user_addresses 
         WHERE id = ?`,
        [assignment.delivery_address_id]
      );

      if (deliveryAddresses.length > 0) {
        deliveryCoordinates = {
          latitude: Number.parseFloat(deliveryAddresses[0].latitude),
          longitude: Number.parseFloat(deliveryAddresses[0].longitude),
        };
      }
    }

    // If delivery address not found in user_addresses, get from orders table
    if (
      !deliveryCoordinates &&
      assignment.delivery_latitude &&
      assignment.delivery_longitude
    ) {
      deliveryCoordinates = {
        latitude: Number.parseFloat(assignment.delivery_latitude),
        longitude: Number.parseFloat(assignment.delivery_longitude),
      };
    }

    // Get order items with product details
    const [orderItems] = await db.execute(
      `SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.preparation_options,
        oi.item_status,
        oi.seller_notes,
        p.name as product_name,
        p.description as product_description,
        p.image_keys as product_image_keys,
        p.unit_type
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id`,
      [assignment.order_id]
    );

    // Get signed URLs for product images
    const itemsWithImages = await Promise.all(
      orderItems.map(async (item) => {
        let productImageUrl = null;

        if (item.product_image_keys) {
          try {
            const { data } = supabase.storage
              .from("products")
              .getPublicUrl(item.product_image_keys);
            productImageUrl = data.publicUrl;
          } catch (error) {
            console.error("Error getting product image URL:", error);
          }
        }

        return {
          ...item,
          product_image_url: productImageUrl,
        };
      })
    );

    // Get signed URL for store logo
    let storeLogoUrl = null;
    if (assignment.store_logo_key) {
      try {
        const { data } = supabase.storage
          .from("vendor-assets")
          .getPublicUrl(assignment.store_logo_key);
        storeLogoUrl = data.publicUrl;
      } catch (error) {
        console.error("Error getting store logo URL:", error);
      }
    }

    // Get signed URL for proof of delivery image
    let proofOfDeliveryUrl = null;
    if (assignment.proof_of_delivery_image) {
      try {
        const { data } = supabase.storage
          .from("delivery-partner-assets")
          .getPublicUrl(assignment.proof_of_delivery_image);
        proofOfDeliveryUrl = data.publicUrl;
      } catch (error) {
        console.error("Error getting proof of delivery image URL:", error);
      }
    }

    // Check if this delivery partner can interact with this assignment
    const canInteract =
      assignment.candidate_status === "pending" ||
      assignment.candidate_status === "accepted" ||
      assignment.delivery_partner_id === partnerId;

    const deliveryDetails = {
      ...assignment,
      store_logo_url: storeLogoUrl,
      order_items: itemsWithImages,
      proof_of_delivery_url: proofOfDeliveryUrl,
      can_interact: canInteract,
      total_items: orderItems.length,
      pickup_coordinates: pickupCoordinates, // Added field
      delivery_coordinates: deliveryCoordinates, // Added field
    };

    res.status(200).json({
      message: "Delivery details retrieved successfully",
      success: true,
      data: deliveryDetails,
    });
  } catch (error) {
    console.error("Error fetching delivery details:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = getDeliveryDetails;
