const db = require("../../../config/db");

const getSellerConversationId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: chatUserId } = req.params;

    if (!chatUserId) {
      return res
        .status(400)
        .json({ success: false, message: "User id is required." });
    }

    const [sellerIds] = await db.execute(
      "SELECT id FROM sellers WHERE user_id = ?",
      [userId]
    );

    if (sellerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User doesn't have seller account yet.",
      });
    }

    const sellerId = sellerIds[0].id;

    const [conversations] = await db.execute(
      "SELECT id FROM conversations WHERE user_id = ? AND seller_id = ?",
      [chatUserId, sellerId]
    );

    if (conversations.length === 0) {
      return res.status(403).json({
        success: false,
        message: `Seller have no conversation with user yet.`,
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

module.exports = getSellerConversationId;
