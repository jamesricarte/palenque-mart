const db = require("../../../config/db");

const markDeliveryPartnerMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { orderId } = req.query;

    // Verify user has access to this conversation
    const [conversationCheck] = await db.execute(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ? AND order_id = ? AND conversation_type = 'order_chat'",
      [conversationId, userId, orderId]
    );

    if (conversationCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      });
    }

    // Mark messages as read and reset unread count
    await db.execute(
      `UPDATE messages SET is_read = 1 
       WHERE conversation_id = ? AND sender_type = 'delivery_partner' AND is_read = 0`,
      [conversationId]
    );

    await db.execute(
      "UPDATE conversations SET user_unread_count = 0 WHERE id = ?",
      [conversationId]
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking delivery partner messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};

module.exports = markDeliveryPartnerMessagesAsRead;
