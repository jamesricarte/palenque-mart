const db = require("../../config/db")

const toggleProductPreOrder = async (req, res) => {
  const { productId } = req.params
  const { pre_order_enabled } = req.body
  const userId = req.user.id

  try {
    // Validate input
    if (typeof pre_order_enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "pre_order_enabled must be a boolean value",
      })
    }

    // First, get the seller_id for this user
    const [sellerRows] = await db.execute("SELECT id FROM sellers WHERE user_id = ? AND is_active = 1", [userId])

    if (sellerRows.length === 0) {
      return res.status(404).json({
        message: "Seller profile not found.",
        success: false,
        error: { code: "SELLER_NOT_FOUND" },
      })
    }

    const sellerId = sellerRows[0].id

    // Check if the product exists and belongs to the seller
    const checkProductQuery = `
      SELECT id, name, pre_order_enabled 
      FROM products 
      WHERE id = ? AND seller_id = ? AND is_active = 1
    `

    const [productRows] = await db.execute(checkProductQuery, [productId, sellerId])

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to modify it",
      })
    }

    const product = productRows[0]

    // Update the pre_order_enabled status
    const updateQuery = `
      UPDATE products 
      SET pre_order_enabled = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND seller_id = ?
    `

    const [updateResult] = await db.execute(updateQuery, [pre_order_enabled, productId, sellerId])

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to update product pre-order status",
      })
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: `Pre-order ${pre_order_enabled ? "enabled" : "disabled"} for ${product.name}`,
      data: {
        productId: Number.parseInt(productId),
        productName: product.name,
        pre_order_enabled: pre_order_enabled,
      },
    })
  } catch (error) {
    console.error("Error toggling product pre-order status:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error while updating pre-order status",
      error: { code: "TOGGLE_PREORDER_ERROR", details: error.message },
    })
  }
}

module.exports = toggleProductPreOrder
