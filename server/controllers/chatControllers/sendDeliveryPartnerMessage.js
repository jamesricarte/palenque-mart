const db = require("../../config/db");

const sendDeliveryPartnerMessage = async (req, res) => {
  try {
    const {
      conversationId,
      sellerId,
      messageText,
      messageType = "text",
    } = req.body;
    let deliveryPartnerId = req.user.id;

    const [deliveryPartnerIds] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ?",
      [deliveryPartnerId]
    );

    deliveryPartnerId = deliveryPartnerIds[0].id;

    if (!conversationId || !sellerId || !messageText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    try {
      // Get or create conversation
      let conversation;
      if (conversationId) {
        const [existingConversation] = await db.execute(
          "SELECT * FROM conversations WHERE id = ? AND delivery_partner_id = ? AND seller_id = ?",
          [conversationId, deliveryPartnerId, sellerId]
        );
        conversation = existingConversation[0];
      }

      if (!conversation) {
        const [newConversation] = await db.execute(
          `INSERT INTO conversations (seller_id, delivery_partner_id, is_active, created_at, updated_at) 
           VALUES (?, ?, 1, NOW(), NOW())`,
          [sellerId, deliveryPartnerId]
        );
        conversation = { id: newConversation.insertId };
      }

      // Insert message
      const [messageResult] = await db.execute(
        `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type, created_at, updated_at) 
         VALUES (?, ?, 'delivery_partner', ?, ?, NOW(), NOW())`,
        [conversation.id, deliveryPartnerId, messageText.trim(), messageType]
      );

      // Update conversation
      await db.execute(
        `UPDATE conversations 
         SET last_message_id = ?, 
             last_message_at = NOW(), 
             seller_unread_count = seller_unread_count + 1,
             updated_at = NOW()
         WHERE id = ?`,
        [messageResult.insertId, conversation.id]
      );

      // Get the created message with sender info
      const [newMessage] = await db.execute(
        `SELECT m.*, dp.partner_id as sender_name
         FROM messages m
         LEFT JOIN delivery_partners dp ON m.sender_id = dp.id
         WHERE m.id = ?`,
        [messageResult.insertId]
      );

      res.json({
        success: true,
        data: {
          message: newMessage[0],
          conversationId: conversation.id,
        },
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error sending delivery partner message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

module.exports = sendDeliveryPartnerMessage;
