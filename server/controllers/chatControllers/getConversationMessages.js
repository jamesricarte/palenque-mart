const db = require("../../config/db")

const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    // Verify user has access to this conversation
    const [conversationCheck] = await db.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", [
      conversationId,
      userId,
    ])

    if (conversationCheck.length === 0) {
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
    console.error("Error fetching conversation messages:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    })
  }
}

module.exports = getConversationMessages
