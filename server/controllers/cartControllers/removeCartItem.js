const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

const removeCartItem = async (req, res) => {
  const { id: userId } = req.user;
  const { cartId } = req.params;

  const formValidation = formValidator.validate(req.user);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  try {
    // Check if cart item exists and belongs to user
    const [cartRows] = await db.execute(
      "SELECT id FROM cart WHERE id = ? AND user_id = ?",
      [cartId, userId]
    );

    if (cartRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Remove cart item
    await db.execute("DELETE FROM cart WHERE id = ?", [cartId]);

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = removeCartItem;
