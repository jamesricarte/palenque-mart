const db = require("../../../config/db");
const supabase = require("../../../config/supabase");

const getSellerConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Get seller ID and verify access to conversation
    const [sellerCheck] = await db.execute(
      `SELECT s.id FROM sellers s 
       JOIN conversations c ON s.id = c.seller_id 
       WHERE s.user_id = ? AND c.id = ? AND s.is_active = 1`,
      [userId, conversationId]
    );

    if (sellerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
      });
    }

    const query = `
      SELECT m.*, 
             bo.id as bargain_id, bo.product_id, bo.original_price, bo.offered_price,
             bo.current_price, bo.offer_type, bo.status, bo.is_final_offer,
             p.name as product_name, p.image_keys as product_image_keys, p.minimum_offer_price
      FROM messages m
      LEFT JOIN bargain_offers bo ON m.bargain_offer_id = bo.id
      LEFT JOIN products p ON bo.product_id = p.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `;

    const [messages] = await db.execute(query, [conversationId]);

    const formattedMessages = messages.map((message) => {
      const messageData = {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        sender_type: message.sender_type,
        message_text: message.message_text,
        message_type: message.message_type,
        order_id: message.order_id,
        image_url: message.image_url,
        is_read: message.is_read,
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
          product_image: productImageUrl,
          original_price: message.original_price,
          offered_price: message.offered_price,
          current_price: message.current_price,
          offer_type: message.offer_type,
          status: message.status,
          is_final_offer: message.is_final_offer,
          minimum_offer_price: message.minimum_offer_price, // Added minimum_offer_price
        };
      }

      return messageData;
    });

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
      },
    });
  } catch (error) {
    console.error("Error fetching seller conversation messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

module.exports = getSellerConversationMessages;
