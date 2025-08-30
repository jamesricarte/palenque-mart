const db = require("../../config/db");

const createBargainOffer = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { productId, offeredPrice, conversationId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId || !offeredPrice || !conversationId) {
      return res.status(400).json({
        success: false,
        message: "Product ID, offered price, and conversation ID are required",
      });
    }

    // Check if there's an ongoing bargain for this product in this conversation
    const [existingOffer] = await connection.execute(
      `SELECT id FROM bargain_offers 
       WHERE conversation_id = ? AND product_id = ? AND status = 'pending'`,
      [conversationId, productId]
    );

    if (existingOffer.length > 0) {
      return res.status(400).json({
        success: false,
        message: "There is already an ongoing bargain for this product",
      });
    }

    // Get product details
    const [product] = await connection.execute(
      "SELECT price, name, seller_id, bargaining_enabled, minimum_offer_price FROM products WHERE id = ?",
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const originalPrice = parseFloat(product[0].price);
    const productName = product[0].name;
    const sellerId = product[0].seller_id;
    const bargainingEnabled = product[0].bargaining_enabled;
    const minimumOfferPrice = parseFloat(product[0].minimum_offer_price);

    if (!bargainingEnabled) {
      return res.status(400).json({
        success: false,
        message: "Bargaining is not enabled for this product",
      });
    }

    const minimumAllowed = minimumOfferPrice || originalPrice * 0.5;
    if (
      offeredPrice <= 0 ||
      offeredPrice >= originalPrice ||
      offeredPrice < minimumAllowed
    ) {
      return res.status(400).json({
        success: false,
        message: `Offered price must be between ₱${minimumAllowed.toFixed(
          2
        )} and ₱${originalPrice.toFixed(2)}`,
      });
    }

    // Create message first
    const messageText = `Made an offer for ${productName}`;
    const [messageResult] = await connection.execute(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type) 
       VALUES (?, ?, 'user', ?, 'bargain_offer')`,
      [conversationId, userId, messageText]
    );

    const messageId = messageResult.insertId;

    // Create bargain offer
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const [offerResult] = await connection.execute(
      `INSERT INTO bargain_offers 
       (message_id, conversation_id, product_id, original_price, offered_price, current_price, 
        offer_type, offered_by_type, offered_by_id, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'initial_offer', 'user', ?, ?)`,
      [
        messageId,
        conversationId,
        productId,
        originalPrice,
        offeredPrice,
        offeredPrice,
        userId,
        expiresAt,
      ]
    );

    // Update message with bargain_offer_id
    await connection.execute(
      "UPDATE messages SET bargain_offer_id = ? WHERE id = ?",
      [offerResult.insertId, messageId]
    );

    // Update conversation last message
    await connection.execute(
      "UPDATE conversations SET last_message_id = ?, last_message_at = NOW(), seller_unread_count = seller_unread_count + 1 WHERE id = ?",
      [messageId, conversationId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Bargain offer created successfully",
      data: {
        offerId: offerResult.insertId,
        messageId: messageId,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating bargain offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bargain offer",
    });
  } finally {
    connection.release();
  }
};

module.exports = createBargainOffer;
