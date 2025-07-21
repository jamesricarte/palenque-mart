const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

const getCartCount = async (req, res) => {
  const { id: userId } = req.user;

  const formValidation = formValidator.validate(req.user);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  try {
    const query = `
      SELECT 
        COALESCE(SUM(c.quantity), 0) as total_items,
        COUNT(c.id) as unique_items
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ? AND p.is_active = 1
    `;

    const [results] = await db.execute(query, [userId]);
    const cartCount = results[0];

    res.status(200).json({
      success: true,
      message: "Cart count fetched successfully",
      data: {
        totalItems: parseInt(cartCount.total_items),
        uniqueItems: parseInt(cartCount.unique_items),
      },
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

module.exports = getCartCount;
