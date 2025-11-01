const db = require("../../config/db")

const updateLivestreamProducts = async (req, res) => {
  try {
    const { livestreamId } = req.params
    const { productIds } = req.body

    // Remove existing products
    await db.execute(`DELETE FROM livestream_products WHERE livestream_id = ?`, [livestreamId])

    // Add new products
    if (productIds && productIds.length > 0) {
      const productValues = productIds.map((productId, index) => [livestreamId, productId, index])

      await db.query(`INSERT INTO livestream_products (livestream_id, product_id, display_order) VALUES ?`, [
        productValues,
      ])
    }

    res.status(200).json({
      success: true,
      message: "Products updated successfully",
    })
  } catch (error) {
    console.error("Update products error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = updateLivestreamProducts
