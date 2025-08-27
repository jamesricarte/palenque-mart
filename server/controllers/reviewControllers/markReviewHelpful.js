const db = require("../../config/db")

const markReviewHelpful = async (req, res) => {
  try {
    const userId = req.user.id
    const { reviewId, reviewType, isHelpful } = req.body

    // Validate input
    if (!reviewId || !reviewType || typeof isHelpful !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Review ID, review type, and helpful status are required",
      })
    }

    if (!["product", "seller"].includes(reviewType)) {
      return res.status(400).json({
        success: false,
        message: "Review type must be 'product' or 'seller'",
      })
    }

    // Check if user has already rated this review
    const [existingRating] = await db.execute(
      `SELECT id, is_helpful FROM review_helpfulness 
       WHERE user_id = ? AND review_id = ? AND review_type = ?`,
      [userId, reviewId, reviewType],
    )

    if (existingRating.length > 0) {
      // Update existing rating if different
      if (existingRating[0].is_helpful !== (isHelpful ? 1 : 0)) {
        await db.execute(`UPDATE review_helpfulness SET is_helpful = ? WHERE id = ?`, [
          isHelpful ? 1 : 0,
          existingRating[0].id,
        ])
      }
    } else {
      // Insert new rating
      await db.execute(
        `INSERT INTO review_helpfulness (review_id, review_type, user_id, is_helpful)
         VALUES (?, ?, ?, ?)`,
        [reviewId, reviewType, userId, isHelpful ? 1 : 0],
      )
    }

    // Update helpful count in the review table
    const tableName = reviewType === "product" ? "product_reviews" : "seller_reviews"
    await db.execute(
      `UPDATE ${tableName} SET helpful_count = (
        SELECT COUNT(*) FROM review_helpfulness 
        WHERE review_id = ? AND review_type = ? AND is_helpful = 1
      ) WHERE id = ?`,
      [reviewId, reviewType, reviewId],
    )

    res.status(200).json({
      success: true,
      message: "Review helpfulness updated successfully",
    })
  } catch (error) {
    console.error("Error updating review helpfulness:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update review helpfulness",
      error: error.message,
    })
  }
}

module.exports = markReviewHelpful
