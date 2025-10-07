const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

const getOrderCount = async (req, res) => {
  const { id: userId } = req.user;

  const formValidation = formValidator.validate(req.user);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  try {
    const query = `
      SELECT COUNT(*) as total_orders
      FROM orders o
      JOIN seller_applications sa ON o.seller_id = sa.id
      WHERE sa.user_id = ?
    `;

    const [results] = await db.execute(query, [userId]);
    const orderCount = results[0];

    res.status(200).json({
      success: true,
      message: "Order count fetched successfully",
      data: {
        totalOrders: parseInt(orderCount.total_orders),
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

module.exports = getOrderCount;
