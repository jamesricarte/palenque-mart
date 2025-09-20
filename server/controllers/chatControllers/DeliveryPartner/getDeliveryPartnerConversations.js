const db = require("../../../config/db");
const supabase = require("../../../config/supabase");

const getDeliveryPartnerConversations = async (req, res) => {
  try {
    let deliveryPartnerId = req.user.id;

    const [deliveryPartnerIds] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ?",
      [deliveryPartnerId]
    );

    deliveryPartnerId = deliveryPartnerIds[0].id;

    if (!deliveryPartnerId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Delivery partner profile required.",
      });
    }

    const query = `
      SELECT 
        c.id,
        c.seller_id,
        c.delivery_partner_id,
        c.last_message_at,
        c.delivery_partner_unread_count,
        c.is_active,
        s.store_name,
        s.store_logo_key,
        m.message_text as last_message_text,
        m.sender_type as last_message_sender_type
      FROM conversations c
      LEFT JOIN sellers s ON c.seller_id = s.id
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE c.delivery_partner_id = ? AND c.is_active = 1
      ORDER BY c.last_message_at DESC, c.updated_at DESC
    `;

    const [conversations] = await db.execute(query, [deliveryPartnerId]);

    const conversationWithLogos = await Promise.all(
      conversations.map(async (conversation) => {
        let store_logo_url = null;

        const { data } = supabase.storage
          .from("vendor-assets")
          .getPublicUrl(conversation.store_logo_key);

        store_logo_url = data.publicUrl;

        return {
          ...conversation,
          store_logo_url,
        };
      })
    );

    res.json({
      success: true,
      data: {
        conversations: conversationWithLogos,
        total: conversations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery partner conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

module.exports = getDeliveryPartnerConversations;
