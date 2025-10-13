const db = require("../../../config/db");

const sendSellerMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      conversationId,
      userId: customerId,
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

    // Get seller ID
    const [sellerCheck] = await db.execute(
      "SELECT id FROM sellers WHERE user_id = ? AND is_active = 1",
      [userId]
    );

    if (sellerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Seller account not found",
      });
    }

    const sellerId = sellerCheck[0].id;
    let finalConversationId = conversationId;

    // If no conversationId provided, create or find existing conversation
    if (!conversationId && customerId) {
      const [existingConversation] = await db.execute(
        "SELECT id FROM conversations WHERE user_id = ? AND seller_id = ?",
        [customerId, sellerId]
      );

      if (existingConversation.length > 0) {
        finalConversationId = existingConversation[0].id;
      } else {
        // Create new conversation
        const [newConversation] = await db.execute(
          "INSERT INTO conversations (user_id, seller_id) VALUES (?, ?)",
          [customerId, sellerId]
        );
        finalConversationId = newConversation.insertId;
      }
    }

    // Verify seller has access to this conversation
    const [conversationCheck] = await db.execute(
      "SELECT id FROM conversations WHERE id = ? AND seller_id = ?",
      [finalConversationId, sellerId]
    );

    if (conversationCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      });
    }

    // Insert the message
    const [messageResult] = await db.execute(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type, order_id) 
       VALUES (?, ?, 'seller', ?, ?, ?)`,
      [finalConversationId, userId, messageText.trim(), messageType, orderId]
    );

    // Update conversation with last message info and increment user unread count
    await db.execute(
      `UPDATE conversations 
       SET last_message_id = ?, last_message_at = NOW(), user_unread_count = user_unread_count + 1
       WHERE id = ?`,
      [messageResult.insertId, finalConversationId]
    );

    // Get the created message
    const [newMessage] = await db.execute(
      `SELECT id, sender_id, sender_type, message_text, message_type, order_id, created_at
       FROM messages WHERE id = ?`,
      [messageResult.insertId]
    );

    //Send a websocket message to specific consumer user
    const users = req.app.get("users");

    const refreshChat = {
      type: "REFRESH_USER_CONVERSATIONS",
      message: "Sent message to user",
      data: {
        newMessage: newMessage[0],
        conversationId: finalConversationId,
      },
    };

    const user = users.get(customerId);

    if (user && user.socket && user.socket.readyState === 1) {
      user.socket.send(JSON.stringify(refreshChat));
      console.log(`Sent refresh chat to user id: ${customerId}`);
    }

    res.json({
      success: true,
      data: {
        message: newMessage[0],
      },
    });
  } catch (error) {
    console.error("Error sending seller message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

module.exports = sendSellerMessage;
