const db = require("../../config/db");

const getAllProducts = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.seller_id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.image_keys,
        p.is_active,
        p.created_at,
        p.updated_at,
        s.store_name,
        s.store_description,
        s.account_type,
        s.store_logo_key,
        sa.pickup_address,
        sa.return_address,
        sa.store_location
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN seller_addresses sa ON s.application_id = sa.application_id
      WHERE p.is_active = 1 AND s.is_active = 1
      ORDER BY p.created_at DESC
    `;

    const [results] = await db.execute(query);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products: results,
        count: results.length,
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

module.exports = getAllProducts;
