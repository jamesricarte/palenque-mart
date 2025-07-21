const db = require("../../config/db")
const formValidator = require("../../utils/formValidator")

const addToCart = async (req, res) => {
  const { id: userId } = req.user
  const { productId, quantity = 1 } = req.body

  const formValidation = formValidator.validate(req.user)

  if (!formValidation.validation) {
    return res.status(400).json({ message: formValidation.message, success: false })
  }

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    })
  }

  if (quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be greater than 0",
    })
  }

  try {
    // Check if product exists and is active
    const [productRows] = await db.execute(
      "SELECT id, seller_id, stock_quantity, is_active FROM products WHERE id = ?",
      [productId],
    )

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const product = productRows[0]

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      })
    }

    // Check if user is trying to add their own product to cart
    const [sellerRows] = await db.execute("SELECT user_id FROM sellers WHERE id = ?", [product.seller_id])

    if (sellerRows.length > 0 && sellerRows[0].user_id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot add your own product to cart",
      })
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      })
    }

    // Check if item already exists in cart
    const [existingCartRows] = await db.execute("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?", [
      userId,
      productId,
    ])

    if (existingCartRows.length > 0) {
      // Update existing cart item
      const newQuantity = existingCartRows[0].quantity + quantity

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: "Cannot add more items. Insufficient stock available",
        })
      }

      await db.execute("UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
        newQuantity,
        existingCartRows[0].id,
      ])

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: {
          cartItemId: existingCartRows[0].id,
          quantity: newQuantity,
        },
      })
    } else {
      // Add new item to cart
      const [result] = await db.execute("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [
        userId,
        productId,
        quantity,
      ])

      return res.status(201).json({
        success: true,
        message: "Product added to cart successfully",
        data: {
          cartItemId: result.insertId,
          quantity: quantity,
        },
      })
    }
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = addToCart
