const db = require("../../../config/db")
const supabase = require("../../../config/supabase")

const getUserDeliveryPartnerConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { orderId } = req.query
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit

    // Verify user has access to this conversation
    const [conversationCheck] = await db.execute(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ? AND order_id = ? AND conversation_type = 'order_chat'",
      [conversationId, userId, orderId],
    )

    if (conversationCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      })
    }

    const [messages] = await db.execute(
      `SELECT m.id, m.conversation_id, m.sender_id, m.sender_type, 
              m.message_text, m.message_type, m.created_at, m.is_read
       FROM messages m
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC
       LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      [conversationId],
    )

    res.json({
      success: true,
      data: { messages },
    })
  } catch (error) {
    console.error("Error fetching delivery partner conversation messages:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    })
  }
}

module.exports = getUserDeliveryPartnerConversationMessages
