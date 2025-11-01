const db = require("../../config/db")

const getLivestreamDetails = async (req, res) => {
  try {
    const { livestreamId } = req.params

    const [livestream] = await db.execute(
      `SELECT 
        l.*,
        u.first_name,
        u.last_name,
        s.store_name,
        s.store_logo_key
       FROM livestreams l
       JOIN users u ON l.seller_id = u.id
       JOIN sellers s ON u.id = s.user_id
       WHERE l.livestream_id = ?`,
      [livestreamId],
    )

    if (livestream.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      })
    }

    // Get featured products
    const [products] = await db.execute(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.image_keys,
        lp.is_pinned,
        lp.display_order
       FROM livestream_products lp
       JOIN products p ON lp.product_id = p.id
       WHERE lp.livestream_id = ?
       ORDER BY lp.display_order`,
      [livestreamId],
    )

    res.status(200).json({
      success: true,
      data: {
        livestream: livestream[0],
        products,
      },
    })
  } catch (error) {
    console.error("Get livestream details error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = getLivestreamDetails
