const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        c.id,
        c.seller_id,
        c.last_message_at,
        c.user_unread_count,
        s.store_name,
        s.store_logo_key,
        m.message_text as last_message_text
      FROM conversations c
      JOIN sellers s ON c.seller_id = s.id
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE c.user_id = ? AND c.is_active = 1
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `;

    const [conversations] = await db.execute(query, [userId]);

    const conversationsWithLogos = await Promise.all(
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
        conversations: conversationsWithLogos,
      },
    });
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

module.exports = getUserConversations;
