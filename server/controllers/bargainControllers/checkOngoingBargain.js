const db = require("../../config/db");

const checkOngoingBargain = async (req, res) => {
  try {
    const { productId, conversationId } = req.params;

    // Check if there's an ongoing bargain for this product in this conversation
    const [bargain] = await db.execute(
      `SELECT bo.id, bo.status, bo.current_price, bo.offered_by_type, bo.is_final_offer, bo.expires_at
       FROM bargain_offers bo
       WHERE bo.conversation_id = ? AND bo.product_id = ? AND bo.status = 'pending'
       ORDER BY bo.created_at DESC
       LIMIT 1`,
      [conversationId, productId]
    );

    res.json({
      success: true,
      data: {
        hasOngoingBargain: bargain.length > 0,
        bargain: bargain.length > 0 ? bargain[0] : null,
      },
    });
  } catch (error) {
    console.error("Error checking ongoing bargain:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check ongoing bargain",
    });
  }
};

module.exports = checkOngoingBargain;
