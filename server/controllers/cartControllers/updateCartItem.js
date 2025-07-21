const db = require("../../config/db")
const formValidator = require("../../utils/formValidator")

const updateCartItem = async (req, res) => {
  const { id: userId } = req.user
  const { cartId } = req.params
  const { quantity } = req.body

  const formValidation = formValidator.validate(req.user)

  if (!formValidation.validation) {
    return res.status(400).json({ message: formValidation.message, success: false })
  }

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be greater than 0",
    })
  }

  try {
    // Check if cart item exists and belongs to user
    const [cartRows] = await db.execute(
      "SELECT c.id, c.product_id, p.stock_quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?",
      [cartId, userId],
    )

    if (cartRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      })
    }

    const cartItem = cartRows[0]

    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      })
    }

    // Update cart item quantity
    await db.execute("UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [quantity, cartId])

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        cartItemId: cartId,
        quantity: quantity,
      },
    })
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = updateCartItem
