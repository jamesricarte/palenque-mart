const db = require("../../config/db")

const getSellerConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    // Get seller ID and verify access to conversation
    const [sellerCheck] = await db.execute(
      `SELECT s.id FROM sellers s 
       JOIN conversations c ON s.id = c.seller_id 
       WHERE s.user_id = ? AND c.id = ? AND s.is_active = 1`,
      [userId, conversationId],
    )

    if (sellerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      })
    }

    const query = `
      SELECT 
        id,
        sender_id,
        sender_type,
        message_text,
        message_type,
        order_id,
        image_url,
        is_read,
        created_at
      FROM messages 
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `

    const [messages] = await db.execute(query, [conversationId])

    res.json({
      success: true,
      data: {
        messages: messages,
      },
    })
  } catch (error) {
    console.error("Error fetching seller conversation messages:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    })
  }
}

module.exports = getSellerConversationMessages
