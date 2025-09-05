const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

const addToCart = async (req, res) => {
  const { id: userId } = req.user;
  const { productId, quantity = 1, bargainId = null } = req.body;

  const formValidation = formValidator.validate(req.user);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be greater than 0",
    });
  }

  try {
    // Check if product exists and is active
    const [productRows] = await db.execute(
      "SELECT id, seller_id, stock_quantity, is_active FROM products WHERE id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = productRows[0];

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      });
    }

    // Prevent adding own product
    const [sellerRows] = await db.execute(
      "SELECT user_id FROM sellers WHERE id = ?",
      [product.seller_id]
    );

    if (sellerRows.length > 0 && sellerRows[0].user_id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot add your own product to cart",
      });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
    }

    // Check if any cart row exists for this product (ignore bargain for now)
    const [existingCartRows] = await db.execute(
      "SELECT id, quantity, bargain_offer_id FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existingCartRows.length > 0) {
      const existing = existingCartRows[0];
      let newQuantity = existing.quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: "Cannot add more items. Insufficient stock available",
        });
      }

      // Case 1: Adding non-bargain to existing bargain
      if (!bargainId && existing.bargain_offer_id) {
        await db.execute(
          "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [newQuantity, existing.id]
        );
      }
      // Case 2: Adding bargain to existing non-bargain
      else if (bargainId && !existing.bargain_offer_id) {
        await db.execute(
          "UPDATE cart SET quantity = ?, bargain_offer_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [newQuantity, bargainId, existing.id]
        );
      }
      // Default: same bargain status (both null or both same id)
      else {
        await db.execute(
          "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [newQuantity, existing.id]
        );
      }

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: {
          cartItemId: existing.id,
          quantity: newQuantity,
        },
      });
    } else {
      // Insert new row
      const [result] = await db.execute(
        "INSERT INTO cart (user_id, product_id, quantity, bargain_offer_id) VALUES (?, ?, ?, ?)",
        [userId, productId, quantity, bargainId]
      );

      return res.status(201).json({
        success: true,
        message: "Product added to cart successfully",
        data: {
          cartItemId: result.insertId,
          quantity,
        },
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = addToCart;
