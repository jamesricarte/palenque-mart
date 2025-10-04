const db = require("../../../config/db");

const getDeliveryPartnerConversationId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { orderId, chatType } = req.query; // Added orderId and chatType from query parameters
    let deliveryPartnerId = req.user.id;

    const [deliveryPartnerIds] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ?",
      [deliveryPartnerId]
    );

    deliveryPartnerId = deliveryPartnerIds[0].id;

    if (!sellerId || !orderId || !chatType) {
      return res.status(400).json({
        success: false,
        message: "Seller ID, Order ID, and Chat Type are required",
      });
    }

    let conversationQuery;
    let conversationParams;

    if (chatType === "seller") {
      // Chat between delivery partner and seller for specific order
      conversationQuery = `SELECT id FROM conversations 
                          WHERE delivery_partner_id = ? AND seller_id = ? AND order_id = ? 
                          AND conversation_type = 'order_chat' AND is_active = 1`;
      conversationParams = [deliveryPartnerId, sellerId, orderId];
    } else if (chatType === "consumer") {
      // Chat between delivery partner and consumer for specific order
      // Note: sellerId parameter actually contains user_id when chatType is consumer
      conversationQuery = `SELECT id FROM conversations 
                          WHERE delivery_partner_id = ? AND user_id = ? AND order_id = ? 
                          AND conversation_type = 'order_chat' AND is_active = 1`;
      conversationParams = [deliveryPartnerId, sellerId, orderId]; // sellerId is actually user_id here
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid chat type. Must be 'seller' or 'consumer'",
      });
    }

    // Check if conversation already exists
    const [existingConversation] = await db.execute(
      conversationQuery,
      conversationParams
    );

    if (existingConversation.length > 0) {
      return res.json({
        success: true,
        data: {
          conversationId: existingConversation[0].id,
          exists: true,
        },
      });
    }

    res.json({
      success: true,
      data: {
        conversationId: null,
        exists: false,
      },
    });
  } catch (error) {
    console.error(
      "Error getting/creating delivery partner conversation:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to get conversation ID",
      error: error.message,
    });
  }
};

module.exports = getDeliveryPartnerConversationId;
