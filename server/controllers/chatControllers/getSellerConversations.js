const db = require("../../config/db")

const getSellerConversations = async (req, res) => {
  try {
    const userId = req.user.id

    // Get seller ID from user
    const [sellerCheck] = await db.execute("SELECT id FROM sellers WHERE user_id = ? AND is_active = 1", [userId])

    if (sellerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Seller account not found",
      })
    }

    const sellerId = sellerCheck[0].id

    const query = `
      SELECT 
        c.id,
        c.user_id,
        c.last_message_at,
        c.seller_unread_count,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.phone as customer_phone,
        m.message_text as last_message_text
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE c.seller_id = ? AND c.is_active = 1
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `

    const [conversations] = await db.execute(query, [sellerId])

    res.json({
      success: true,
      data: {
        conversations: conversations,
      },
    })
  } catch (error) {
    console.error("Error fetching seller conversations:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    })
  }
}

module.exports = getSellerConversations
