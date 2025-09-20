const db = require("../../../config/db")

const getSellerDeliveryPartnerConversationId = async (req, res) => {
  try {
    const { deliveryPartnerId } = req.params
    const { orderId } = req.query
    let sellerId = req.user.id

    // Get seller ID from user ID
    const [sellerIds] = await db.execute("SELECT id FROM sellers WHERE user_id = ?", [sellerId])

    if (sellerIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      })
    }

    sellerId = sellerIds[0].id

    if (!deliveryPartnerId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Delivery Partner ID and Order ID are required",
      })
    }

    // Check if conversation already exists
    const conversationQuery = `SELECT id FROM conversations 
                              WHERE seller_id = ? AND delivery_partner_id = ? AND order_id = ? 
                              AND conversation_type = 'order_chat' AND is_active = 1`
    const conversationParams = [sellerId, deliveryPartnerId, orderId]

    const [existingConversation] = await db.execute(conversationQuery, conversationParams)

    if (existingConversation.length > 0) {
      return res.json({
        success: true,
        data: {
          conversationId: existingConversation[0].id,
          exists: true,
        },
      })
    }

    // Return that no conversation exists yet - don't create one
    res.json({
      success: true,
      data: {
        conversationId: null,
        exists: false,
      },
    })
  } catch (error) {
    console.error("Error getting seller-delivery partner conversation:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get conversation ID",
      error: error.message,
    })
  }
}

module.exports = getSellerDeliveryPartnerConversationId
