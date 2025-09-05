const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to this conversation
    const [conversationCheck] = await db.execute(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
      [conversationId, userId]
    );

    if (conversationCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      });
    }

    const [messages] = await db.execute(
      `SELECT m.*, 
              bo.id as bargain_id, bo.product_id, bo.original_price, bo.offered_price,
              bo.current_price, bo.offer_type, bo.status, bo.is_final_offer,
              p.name as product_name, p.stock_quantity, p.image_keys as product_image_keys,
              EXISTS(
                SELECT 1 FROM cart c 
                WHERE c.user_id = ? AND c.product_id = bo.product_id
              ) AS in_cart,
              EXISTS(
                SELECT 1
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.product_id = bo.product_id
                  AND o.user_id = ?
                  AND o.status NOT IN ('cancelled','refunded')
                  AND oi.bargain_offer_id = bo.id
              ) AS in_orders
       FROM messages m
       LEFT JOIN bargain_offers bo ON m.bargain_offer_id = bo.id
       LEFT JOIN products p ON bo.product_id = p.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC
       LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      [userId, userId, conversationId]
    );

    const formattedMessages = messages.map((message) => {
      const messageData = {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        sender_type: message.sender_type,
        message_text: message.message_text,
        message_type: message.message_type,
        created_at: message.created_at,
      };

      if (message.message_type === "bargain_offer" && message.bargain_id) {
        let productImageUrl = null;

        if (message.product_image_keys) {
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(message.product_image_keys);
          productImageUrl = data?.publicUrl || null;
        }

        messageData.bargain_data = {
          id: message.bargain_id,
          product_id: message.product_id,
          product_name: message.product_name,
          stock_quantity: message.stock_quantity,
          product_image: productImageUrl,
          original_price: message.original_price,
          offered_price: message.offered_price,
          current_price: message.current_price,
          offer_type: message.offer_type,
          status: message.status,
          is_final_offer: message.is_final_offer,
          in_cart: !!message.in_cart,
          in_orders: !!message.in_orders,
        };
      }

      return messageData;
    });

    res.json({
      success: true,
      data: { messages: formattedMessages },
    });
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

module.exports = getConversationMessages;
