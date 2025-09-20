const db = require("../../../config/db");

const markDeliveryPartnerMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    let deliveryPartnerId = req.user.id;

    const [deliveryPartnerIds] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ?",
      [deliveryPartnerId]
    );

    deliveryPartnerId = deliveryPartnerIds[0].id;

    // Verify delivery partner has access to this conversation
    const [conversationCheck] = await db.execute(
      "SELECT id FROM conversations WHERE id = ? AND delivery_partner_id = ?",
      [conversationId, deliveryPartnerId]
    );

    if (conversationCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    try {
      // Mark messages as read (messages not sent by delivery partner)
      await db.execute(
        `UPDATE messages 
         SET is_read = 1 
         WHERE conversation_id = ? 
         AND sender_type != 'delivery_partner' 
         AND is_read = 0`,
        [conversationId]
      );

      // Reset delivery partner unread count
      await db.execute(
        `UPDATE conversations 
         SET delivery_partner_unread_count = 0 
         WHERE id = ?`,
        [conversationId]
      );

      res.json({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error marking delivery partner messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

module.exports = markDeliveryPartnerMessagesAsRead;
