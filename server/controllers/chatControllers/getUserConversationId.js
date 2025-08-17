const db = require("../../config/db");

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sellerId } = req.params;

    const query = `SELECT id FROM conversations WHERE seller_id = ? AND user_id = ?`;

    const [conversations] = await db.execute(query, [sellerId, userId]);

    if (conversations.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User have no conversation with seller yet.",
      });
    }

    const conversationId = conversations[0].id;

    res.json({
      success: true,
      data: {
        conversationId: conversationId,
      },
    });
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation id",
    });
  }
};

module.exports = getUserConversations;
