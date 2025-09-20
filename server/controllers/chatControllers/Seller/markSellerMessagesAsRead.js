const db = require("../../../config/db");

const markSellerMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Get seller ID and verify access to conversation
    const [sellerCheck] = await db.execute(
      `SELECT s.id FROM sellers s 
       JOIN conversations c ON s.id = c.seller_id 
       WHERE s.user_id = ? AND c.id = ? AND s.is_active = 1`,
      [userId, conversationId]
    );

    if (sellerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      });
    }

    // Mark messages as read and reset unread count
    await db.execute(
      `UPDATE messages SET is_read = 1 
       WHERE conversation_id = ? AND sender_type = 'user' AND is_read = 0`,
      [conversationId]
    );

    await db.execute(
      "UPDATE conversations SET seller_unread_count = 0 WHERE id = ?",
      [conversationId]
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking seller messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};

module.exports = markSellerMessagesAsRead;
