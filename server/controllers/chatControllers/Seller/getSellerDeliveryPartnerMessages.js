const db = require("../../../config/db")

const getSellerDeliveryPartnerMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { orderId } = req.query
    let sellerId = req.user.id

    // Get seller ID from user ID
    const [sellerIds] = await db.execute("SELECT id FROM sellers WHERE user_id = ?", [sellerId])

    if (sellerIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    sellerId = sellerIds[0].id

    if (!conversationId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and Order ID are required",
      })
    }

    // Verify seller has access to this conversation
    const [conversationCheck] = await db.execute(
      `SELECT id FROM conversations 
       WHERE id = ? AND seller_id = ? AND order_id = ? AND is_active = 1`,
      [conversationId, sellerId, orderId],
    )

    if (conversationCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      })
    }

    // Get messages for this conversation
    const [messages] = await db.execute(
      `SELECT 
        m.*,
        CASE 
          WHEN m.sender_type = 'seller' THEN s.user_id
          WHEN m.sender_type = 'delivery_partner' THEN dp.user_id
        END as sender_user_id
       FROM messages m
       LEFT JOIN sellers s ON m.sender_id = s.id AND m.sender_type = 'seller'
       LEFT JOIN delivery_partners dp ON m.sender_id = dp.id AND m.sender_type = 'delivery_partner'
       WHERE m.conversation_id = ? AND m.order_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId, orderId],
    )

    res.json({
      success: true,
      data: {
        messages,
      },
    })
  } catch (error) {
    console.error("Error fetching seller-delivery partner messages:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    })
  }
}

module.exports = getSellerDeliveryPartnerMessages
