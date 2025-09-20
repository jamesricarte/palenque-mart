const db = require("../../../config/db")

const sendSellerDeliveryPartnerMessage = async (req, res) => {
  try {
    const { conversationId, deliveryPartnerId, messageText, messageType = "text", orderId } = req.body
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

    if (!messageText || !deliveryPartnerId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Message text, delivery partner ID, and order ID are required",
      })
    }

    let finalConversationId = conversationId

    // If no conversation ID provided, create a new conversation
    if (!conversationId) {
      const insertQuery = `INSERT INTO conversations (seller_id, delivery_partner_id, order_id, conversation_type, is_active, created_at, updated_at) 
                           VALUES (?, ?, ?, 'order_chat', 1, NOW(), NOW())`
      const insertParams = [sellerId, deliveryPartnerId, orderId]

      const [newConversation] = await db.execute(insertQuery, insertParams)
      finalConversationId = newConversation.insertId
    }

    // Insert the message
    const [messageResult] = await db.execute(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type, order_id, created_at, updated_at)
       VALUES (?, ?, 'seller', ?, ?, ?, NOW(), NOW())`,
      [finalConversationId, sellerId, messageText, messageType, orderId],
    )

    // Update conversation's last message info
    await db.execute(
      `UPDATE conversations 
       SET last_message_id = ?, last_message_at = NOW(), delivery_partner_unread_count = delivery_partner_unread_count + 1, updated_at = NOW()
       WHERE id = ?`,
      [messageResult.insertId, finalConversationId],
    )

    res.json({
      success: true,
      data: {
        messageId: messageResult.insertId,
        conversationId: finalConversationId,
      },
    })
  } catch (error) {
    console.error("Error sending seller-delivery partner message:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    })
  }
}

module.exports = sendSellerDeliveryPartnerMessage
