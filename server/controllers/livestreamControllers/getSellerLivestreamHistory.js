const db = require("../../config/db")

const getSellerLivestreamHistory = async (req, res) => {
  try {
    const { sellerId } = req.params

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      })
    }

    // Fetch past livestreams (ended or cancelled status)
    const [livestreams] = await db.execute(
      `SELECT 
        l.livestream_id,
        l.title,
        l.description,
        l.thumbnail_url,
        l.status,
        l.actual_start_time,
        l.end_time,
        l.duration_seconds,
        l.peak_viewers,
        l.total_viewers,
        l.total_comments,
        l.total_sales
       FROM livestreams l
       WHERE l.seller_id = ? AND l.status IN ('ended', 'cancelled')
       ORDER BY l.actual_start_time DESC`,
      [sellerId],
    )

    res.status(200).json({
      success: true,
      data: {
        livestreams,
        count: livestreams.length,
      },
    })
  } catch (error) {
    console.error("Get seller livestream history error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = getSellerLivestreamHistory
