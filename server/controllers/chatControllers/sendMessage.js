const db = require("../../config/db");

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      conversationId,
      sellerId,
      messageText,
      messageType = "text",
      orderId = null,
    } = req.body;

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    let finalConversationId = conversationId;

    // If no conversationId provided, create or find existing conversation
    if (!conversationId && sellerId) {
      const [existingConversation] = await db.execute(
        "SELECT id FROM conversations WHERE user_id = ? AND seller_id = ?",
        [userId, sellerId]
      );

      if (existingConversation.length > 0) {
        finalConversationId = existingConversation[0].id;
      } else {
        // Create new conversation
        const [newConversation] = await db.execute(
          "INSERT INTO conversations (user_id, seller_id) VALUES (?, ?)",
          [userId, sellerId]
        );
        finalConversationId = newConversation.insertId;
      }
    }

    if (!finalConversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID or Seller ID is required",
      });
    }

    // Insert the message
    const [messageResult] = await db.execute(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type, order_id) 
       VALUES (?, ?, 'user', ?, ?, ?)`,
      [finalConversationId, userId, messageText.trim(), messageType, orderId]
    );

    // Update conversation with last message info and increment seller unread count
    await db.execute(
      `UPDATE conversations 
       SET last_message_id = ?, last_message_at = NOW(), seller_unread_count = seller_unread_count + 1
       WHERE id = ?`,
      [messageResult.insertId, finalConversationId]
    );

    //Send a websocket message to specific seller
    const sellers = req.app.get("sellers");

    const refreshChat = {
      type: "REFRESH_SELLER_CONVERSATIONS",
      message: "Sent message to seller",
      conversationId: finalConversationId,
    };

    const seller = sellers.get(sellerId);

    if (seller && seller.socket && seller.socket.readyState === 1) {
      seller.socket.send(JSON.stringify(refreshChat));
      console.log(`Sent refresh chat to seller id: ${sellerId}`);
    }

    // Get the created message
    const [newMessage] = await db.execute(
      `SELECT id, sender_id, sender_type, message_text, message_type, order_id, created_at
       FROM messages WHERE id = ?`,
      [messageResult.insertId]
    );

    res.json({
      success: true,
      data: {
        message: newMessage[0],
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

module.exports = sendMessage;
