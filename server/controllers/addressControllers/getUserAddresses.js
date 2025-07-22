const db = require("../../config/db")

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id

    const [addresses] = await db.execute(
      `SELECT * FROM user_addresses 
       WHERE user_id = ? 
       ORDER BY is_default DESC, created_at DESC`,
      [userId],
    )

    res.json({
      success: true,
      data: { addresses },
    })
  } catch (error) {
    console.error("Error fetching user addresses:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    })
  }
}

module.exports = getUserAddresses
