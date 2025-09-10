const db = require("../../config/db");

const getDeliveryPartnerConversationId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    let deliveryPartnerId = req.user.id;

    const [deliveryPartnerIds] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ?",
      [deliveryPartnerId]
    );

    deliveryPartnerId = deliveryPartnerIds[0].id;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    // Check if conversation already exists
    const [existingConversation] = await db.execute(
      `SELECT id FROM conversations 
       WHERE delivery_partner_id = ? AND seller_id = ? AND is_active = 1`,
      [deliveryPartnerId, sellerId]
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

    // Create new conversation
    const [newConversation] = await db.execute(
      `INSERT INTO conversations (delivery_partner_id, seller_id, is_active, created_at, updated_at) 
       VALUES (?, ?, 1, NOW(), NOW())`,
      [deliveryPartnerId, sellerId]
    );

    res.json({
      success: true,
      data: {
        conversationId: newConversation.insertId,
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
