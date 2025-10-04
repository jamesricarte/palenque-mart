const db = require("../../../config/db");

const sendDeliveryPartnerMessage = async (req, res) => {
  try {
    const {
      conversationId,
      sellerId,
      consumerId, // Added consumerId for consumer chats
      messageText,
      messageType = "text",
      orderId, // Added orderId for order-based messages
      chatType, // Added chatType to determine recipient
    } = req.body;
    let deliveryPartnerId = req.user.id;

    const [deliveryPartnerIds] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ?",
      [deliveryPartnerId]
    );

    deliveryPartnerId = deliveryPartnerIds[0].id;

    if (!messageText?.trim() || !orderId || !chatType || !deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: messageText, orderId, chatType, and deliveryPartnerId are required",
      });
    }

    if (chatType === "seller" && !sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required for seller chat",
      });
    }

    if (chatType === "consumer" && !consumerId) {
      return res.status(400).json({
        success: false,
        message: "Consumer ID is required for consumer chat",
      });
    }

    let finalConversationId = conversationId;

    try {
      if (!conversationId) {
        let insertQuery;
        let insertParams;

        if (chatType === "seller") {
          insertQuery = `INSERT INTO conversations (seller_id, delivery_partner_id, order_id, conversation_type, is_active, created_at, updated_at) 
                         VALUES (?, ?, ?, 'order_chat', 1, NOW(), NOW())`;
          insertParams = [sellerId, deliveryPartnerId, orderId];
        } else {
          insertQuery = `INSERT INTO conversations (user_id, delivery_partner_id, order_id, conversation_type, is_active, created_at, updated_at) 
                         VALUES (?, ?, ?, 'order_chat', 1, NOW(), NOW())`;
          insertParams = [consumerId, deliveryPartnerId, orderId];
        }

        const [newConversation] = await db.execute(insertQuery, insertParams);
        finalConversationId = newConversation.insertId;
      }

      const [messageResult] = await db.execute(
        `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type, order_id, created_at, updated_at) 
         VALUES (?, ?, 'delivery_partner', ?, ?, ?, NOW(), NOW())`,
        [
          finalConversationId,
          deliveryPartnerId,
          messageText.trim(),
          messageType,
          orderId,
        ]
      );

      let updateQuery;
      if (chatType === "seller") {
        updateQuery = `UPDATE conversations 
                       SET last_message_id = ?, 
                           last_message_at = NOW(), 
                           seller_unread_count = seller_unread_count + 1,
                           updated_at = NOW()
                       WHERE id = ?`;
      } else {
        updateQuery = `UPDATE conversations 
                       SET last_message_id = ?, 
                           last_message_at = NOW(), 
                           user_unread_count = user_unread_count + 1,
                           updated_at = NOW()
                       WHERE id = ?`;
      }

      await db.execute(updateQuery, [
        messageResult.insertId,
        finalConversationId,
      ]);

      // Get the created message with sender info
      const [newMessage] = await db.execute(
        `SELECT m.*, dp.partner_id as sender_name
         FROM messages m
         LEFT JOIN delivery_partners dp ON m.sender_id = dp.id
         WHERE m.id = ?`,
        [messageResult.insertId]
      );

      const receiver = chatType;

      const refreshChat = {
        type:
          receiver === "seller"
            ? "REFRESH_SELLER_CONVERSATIONS"
            : "REFRESH_USER_CONVERSATIONS",
        message: `Sent message to ${receiver}`,
        data: {
          newMessage: newMessage[0],
          conversationId: finalConversationId,
          orderId: Number.parseInt(orderId),
        },
      };

      const receiverSockets =
        receiver === "seller" ? req.app.get("sellers") : req.app.get("users");
      const receiverId = receiver === "seller" ? sellerId : consumerId;
      const receiverSocket = receiverSockets.get(receiverId);

      if (
        receiverSocket &&
        receiverSocket.socket &&
        receiverSocket.socket.readyState === 1
      ) {
        receiverSocket.socket.send(JSON.stringify(refreshChat));
        console.log(`Sent refresh chat to ${receiver} id: ${receiverId}`);
      }

      res.json({
        success: true,
        data: {
          message: newMessage[0],
          conversationId: finalConversationId,
          orderId: Number.parseInt(orderId),
          chatType,
        },
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error sending delivery partner message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

module.exports = sendDeliveryPartnerMessage;
