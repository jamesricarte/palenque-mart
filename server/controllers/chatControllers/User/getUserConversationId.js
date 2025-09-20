const db = require("../../../config/db");

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sellerId, deliveryPartnerId, orderId } = req.params;

    let query;
    let params;

    if (sellerId) {
      // Original seller conversation logic
      query = `SELECT id FROM conversations WHERE seller_id = ? AND user_id = ?`;
      params = [sellerId, userId];
    } else if (deliveryPartnerId && orderId) {
      // New delivery partner conversation logic for order-based chat
      query = `SELECT id FROM conversations WHERE delivery_partner_id = ? AND user_id = ? AND order_id = ? AND conversation_type = 'order_chat'`;
      params = [deliveryPartnerId, userId, orderId];
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Either sellerId or both deliveryPartnerId and orderId are required.",
      });
    }

    const [conversations] = await db.execute(query, params);

    if (conversations.length === 0) {
      const conversationType = sellerId ? "seller" : "delivery partner";
      return res.status(403).json({
        success: false,
        message: `User have no conversation with ${conversationType} yet.`,
      });
    }

    const conversationId = conversations[0].id;

    res.json({
      success: true,
      data: {
        conversationId: conversationId,
      },
    });
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation id",
    });
  }
};

module.exports = getUserConversations;
