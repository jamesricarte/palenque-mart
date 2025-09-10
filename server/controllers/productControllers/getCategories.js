const db = require("../../config/db")

const getCategories = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT p.category
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.is_active = 1 AND s.is_active = 1 AND p.category IS NOT NULL
      ORDER BY p.category ASC
    `

    const [results] = await db.execute(query)
    const categories = results.map((row) => row.category)

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: {
        categories: categories,
        count: categories.length,
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

module.exports = getCategories
