const db = require("../../config/db");

const respondToBargainOffer = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { offerId } = req.params;
    const { action, counterOfferPrice, isFinalOffer } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!["accept", "reject", "counter"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be accept, reject, or counter",
      });
    }

    // Get bargain offer details
    const [offer] = await connection.execute(
      `SELECT bo.*, p.name as product_name, p.seller_id, c.user_id, c.seller_id as conversation_seller_id
       FROM bargain_offers bo
       JOIN products p ON bo.product_id = p.id
       JOIN conversations c ON bo.conversation_id = c.id
       WHERE bo.id = ? AND bo.status = 'pending'`,
      [offerId]
    );

    if (offer.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bargain offer not found or already processed",
      });
    }

    const offerData = offer[0];

    // Check if user is authorized to respond (must be the other party)
    const isUserResponding =
      offerData.offered_by_type === "seller" && userId === offerData.user_id;
    const isSellerResponding =
      offerData.offered_by_type === "user" &&
      userId === offerData.conversation_seller_id;

    if (!isUserResponding && !isSellerResponding) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to respond to this offer",
      });
    }

    const responderType = isUserResponding ? "user" : "seller";
    let messageText = "";

    if (action === "accept") {
      // Accept the offer
      await connection.execute(
        "UPDATE bargain_offers SET status = ?, responded_at = NOW() WHERE id = ?",
        ["accepted", offerId]
      );

      messageText = `Accepted the offer for ${offerData.product_name} at ₱${offerData.current_price}`;
    } else if (action === "reject") {
      // Reject the offer
      await connection.execute(
        "UPDATE bargain_offers SET status = ?, responded_at = NOW() WHERE id = ?",
        ["rejected", offerId]
      );

      messageText = `Rejected the offer for ${offerData.product_name}`;
    } else if (action === "counter") {
      // Validate counter offer price
      if (!counterOfferPrice || counterOfferPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Counter offer price is required and must be greater than 0",
        });
      }

      // Mark current offer as responded
      await connection.execute(
        "UPDATE bargain_offers SET responded_at = NOW() WHERE id = ?",
        [offerId]
      );

      // Create counter offer message
      messageText = `Made a counter offer for ${offerData.product_name}`;
      const [messageResult] = await connection.execute(
        `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type) 
         VALUES (?, ?, ?, ?, 'bargain_offer')`,
        [offerData.conversation_id, userId, responderType, messageText]
      );

      const messageId = messageResult.insertId;

      // Create counter offer
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const [counterOfferResult] = await connection.execute(
        `INSERT INTO bargain_offers 
         (message_id, conversation_id, product_id, original_price, offered_price, current_price, 
          offer_type, offered_by_type, offered_by_id, parent_offer_id, is_final_offer, expires_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'counteroffer', ?, ?, ?, ?, ?)`,
        [
          messageId,
          offerData.conversation_id,
          offerData.product_id,
          offerData.original_price,
          counterOfferPrice,
          counterOfferPrice,
          responderType,
          userId,
          offerId,
          isFinalOffer || false,
          expiresAt,
        ]
      );

      // Update message with bargain_offer_id
      await connection.execute(
        "UPDATE messages SET bargain_offer_id = ? WHERE id = ?",
        [counterOfferResult.insertId, messageId]
      );

      // Update conversation last message
      const unreadField =
        responderType === "user" ? "seller_unread_count" : "user_unread_count";
      await connection.execute(
        `UPDATE conversations SET last_message_id = ?, last_message_at = NOW(), ${unreadField} = ${unreadField} + 1 WHERE id = ?`,
        [messageId, offerData.conversation_id]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: "Counter offer created successfully",
        data: {
          offerId: counterOfferResult.insertId,
          messageId: messageId,
        },
      });
    }

    // For accept/reject, create response message
    const [messageResult] = await connection.execute(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, message_text, message_type) 
       VALUES (?, ?, ?, ?, 'text')`,
      [offerData.conversation_id, userId, responderType, messageText]
    );

    // Update conversation last message
    const unreadField =
      responderType === "user" ? "seller_unread_count" : "user_unread_count";
    await connection.execute(
      `UPDATE conversations SET last_message_id = ?, last_message_at = NOW(), ${unreadField} = ${unreadField} + 1 WHERE id = ?`,
      [messageResult.insertId, offerData.conversation_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Offer ${action}ed successfully`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error responding to bargain offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to bargain offer",
    });
  } finally {
    connection.release();
  }
};

module.exports = respondToBargainOffer;
