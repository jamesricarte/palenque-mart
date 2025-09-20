const db = require("../../../config/db");

const getDeliveryPartnerConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { orderId, chatType } = req.query; // Added orderId and chatType from query parameters
    let deliveryPartnerId = req.user.id;

    const [deliveryPartnerIds] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ?",
      [deliveryPartnerId]
    );

    deliveryPartnerId = deliveryPartnerIds[0].id;

    const [conversationCheck] = await db.execute(
      `SELECT id, order_id, conversation_type FROM conversations 
       WHERE id = ? AND delivery_partner_id = ? 
       AND (order_id = ? OR order_id IS NULL)`,
      [conversationId, deliveryPartnerId, orderId]
    );

    if (conversationCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    const query = `
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.sender_type,
        m.message_text,
        m.message_type,
        m.order_id,
        m.is_read,
        m.created_at,
        CASE 
          WHEN m.sender_type = 'seller' THEN s.store_name
          WHEN m.sender_type = 'delivery_partner' THEN dp.partner_id
          WHEN m.sender_type = 'user' THEN CONCAT(u.first_name, ' ', u.last_name)
          ELSE 'Unknown'
        END as sender_name
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id AND m.sender_type = 'user'
      LEFT JOIN sellers s ON m.sender_id = s.id AND m.sender_type = 'seller'
      LEFT JOIN delivery_partners dp ON m.sender_id = dp.id AND m.sender_type = 'delivery_partner'
      WHERE m.conversation_id = ? 
      AND (m.order_id = ? OR m.order_id IS NULL)
      ORDER BY m.created_at ASC
    `;

    const [messages] = await db.execute(query, [conversationId, orderId]);

    res.json({
      success: true,
      data: {
        messages,
        conversationId: Number.parseInt(conversationId),
        orderId: orderId ? Number.parseInt(orderId) : null,
        chatType,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching delivery partner conversation messages:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

module.exports = getDeliveryPartnerConversationMessages;
