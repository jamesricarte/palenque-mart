const db = require("../../config/db");

/**
 * Get unread message count for a specific user from their chatmates
 * This controller handles all scenarios:
 * - Delivery Partner getting unread counts from seller and consumer
 * - Seller getting unread count from delivery partner
 * - User getting unread count from delivery partner
 */
const getUnreadMessageCount = async (req, res) => {
  try {
    const { userId, userType, orderId, chatmateType } = req.query;

    if (!userId || !userType || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: userId, userType, orderId",
      });
    }

    let query;
    let queryParams;

    if (userType === "delivery_partner") {
      if (chatmateType === "seller") {
        // Delivery partner getting unread count from seller
        query = `
          SELECT COUNT(*) as unread_count
          FROM messages m
          INNER JOIN conversations c ON m.conversation_id = c.id
          WHERE c.order_id = ?
            AND c.delivery_partner_id = ?
            AND m.sender_type = 'seller'
            AND m.is_read = 0
        `;
        queryParams = [orderId, userId];
      } else if (chatmateType === "consumer") {
        // Delivery partner getting unread count from consumer
        query = `
          SELECT COUNT(*) as unread_count
          FROM messages m
          INNER JOIN conversations c ON m.conversation_id = c.id
          WHERE c.order_id = ?
            AND c.delivery_partner_id = ?
            AND m.sender_type = 'user'
            AND m.is_read = 0
        `;
        queryParams = [orderId, userId];
      } else {
        return res.status(400).json({
          success: false,
          message:
            'For delivery_partner, chatmateType must be either "seller" or "consumer"',
        });
      }
    } else if (userType === "seller") {
      // Seller getting unread count from delivery partner
      query = `
        SELECT COUNT(*) as unread_count
        FROM messages m
        INNER JOIN conversations c ON m.conversation_id = c.id
        WHERE c.order_id = ?
          AND c.seller_id = ?
          AND m.sender_type = 'delivery_partner'
          AND m.is_read = 0
      `;
      queryParams = [orderId, userId];
    } else if (userType === "user") {
      // User getting unread count from delivery partner
      query = `
        SELECT COUNT(*) as unread_count
        FROM messages m
        INNER JOIN conversations c ON m.conversation_id = c.id
        WHERE c.order_id = ?
          AND c.user_id = ?
          AND m.sender_type = 'delivery_partner'
          AND m.is_read = 0
      `;
      queryParams = [orderId, userId];
    } else {
      return res.status(400).json({
        success: false,
        message:
          'Invalid userType. Must be "delivery_partner", "seller", or "user"',
      });
    }

    const [results] = await db.execute(query, queryParams);
    const unreadCount = results[0]?.unread_count || 0;

    res.json({
      success: true,
      data: {
        unreadCount: Number.parseInt(unreadCount),
        userId,
        userType,
        orderId,
        chatmateType: chatmateType || "delivery_partner",
      },
    });
  } catch (error) {
    console.error("Error getting unread message count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread message count",
      error: error.message,
    });
  }
};

/**
 * Get unread message counts for multiple chatmates at once
 * Useful for delivery partners who need counts for both seller and consumer
 */
const getMultipleUnreadCounts = async (req, res) => {
  try {
    const { userId, userType, orderId } = req.query;

    if (!userId || !userType || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: userId, userType, orderId",
      });
    }

    if (userType !== "delivery_partner") {
      return res.status(400).json({
        success: false,
        message: "This endpoint is only for delivery partners",
      });
    }

    // Get unread count from seller
    const sellerQuery = `
      SELECT COUNT(*) as unread_count
      FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE c.order_id = ?
        AND c.delivery_partner_id = ?
        AND m.sender_type = 'seller'
        AND m.is_read = 0
    `;

    // Get unread count from consumer
    const consumerQuery = `
      SELECT COUNT(*) as unread_count
      FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE c.order_id = ?
        AND c.delivery_partner_id = ?
        AND m.sender_type = 'user'
        AND m.is_read = 0
    `;

    const [sellerResults] = await db.execute(sellerQuery, [orderId, userId]);
    const [consumerResults] = await db.execute(consumerQuery, [
      orderId,
      userId,
    ]);

    const sellerUnreadCount = sellerResults[0]?.unread_count || 0;
    const consumerUnreadCount = consumerResults[0]?.unread_count || 0;

    res.json({
      success: true,
      data: {
        seller: {
          unreadCount: Number.parseInt(sellerUnreadCount),
        },
        consumer: {
          unreadCount: Number.parseInt(consumerUnreadCount),
        },
        total:
          Number.parseInt(sellerUnreadCount) +
          Number.parseInt(consumerUnreadCount),
        userId,
        userType,
        orderId,
      },
    });
  } catch (error) {
    console.error("Error getting multiple unread message counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread message counts",
      error: error.message,
    });
  }
};

module.exports = {
  getUnreadMessageCount,
  getMultipleUnreadCounts,
};
