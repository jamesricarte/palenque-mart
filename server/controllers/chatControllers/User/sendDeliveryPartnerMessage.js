const db = require("../../../config/db")

const sendDeliveryPartnerMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId, deliveryPartnerId, orderId, messageText, messageType = "text" } = req.body

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      })
    }

    if (!deliveryPartnerId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Delivery partner ID and order ID are required",
      })
    }

    let finalConversationId = conversationId

    // If no conversationId provided, create new conversation for order-based chat
    if (!conversationId) {
      // Check if conversation already exists
      const [existingConversation] = await db.execute(
        "SELECT id FROM conversations WHERE user_id = ? AND delivery_partner_id = ? AND order_id = ? AND conversation_type = 'order_chat'",
        [userId, deliveryPartnerId, orderId],
      )

      if (existingConversation.length > 0) {
        finalConversationId = existingConversation[0].id
      } else {
        // Create new order-based conversation
        const [newConversation] = await db.execute(
          "INSERT INTO conversations (user_id, delivery_partner_id, order_id, conversation_type) VALUES (?, ?, ?, 'order_chat')",
          [userId, deliveryPartnerId, orderId],
        )
        finalConversationId = newConversation.insertId
      }
    }

    // Insert the message
    const [messageResult] = await db.execute(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type, order_id) 
       VALUES (?, ?, 'user', ?, ?, ?)`,
      [finalConversationId, userId, messageText.trim(), messageType, orderId],
    )

    // Update conversation with last message info and increment delivery partner unread count
    await db.execute(
      `UPDATE conversations 
       SET last_message_id = ?, last_message_at = NOW(), delivery_partner_unread_count = delivery_partner_unread_count + 1
       WHERE id = ?`,
      [messageResult.insertId, finalConversationId],
    )

    // Send websocket message to delivery partner
    const deliveryPartners = req.app.get("deliveryPartners")

    const refreshChat = {
      type: "REFRESH_DELIVERY_PARTNER_CONVERSATIONS",
      message: "Sent message to delivery partner",
      conversationId: finalConversationId,
    }

    const deliveryPartner = deliveryPartners.get(deliveryPartnerId)

    if (deliveryPartner && deliveryPartner.socket && deliveryPartner.socket.readyState === 1) {
      deliveryPartner.socket.send(JSON.stringify(refreshChat))
      console.log(`Sent refresh chat to delivery partner id: ${deliveryPartnerId}`)
    }

    // Get the created message
    const [newMessage] = await db.execute(
      `SELECT id, sender_id, sender_type, message_text, message_type, order_id, created_at
       FROM messages WHERE id = ?`,
      [messageResult.insertId],
    )

    res.json({
      success: true,
      data: {
        message: newMessage[0],
        conversationId: finalConversationId,
      },
    })
  } catch (error) {
    console.error("Error sending delivery partner message:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    })
  }
}

module.exports = sendDeliveryPartnerMessage
