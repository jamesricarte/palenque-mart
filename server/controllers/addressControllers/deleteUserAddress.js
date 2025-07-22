const db = require("../../config/db")

const deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user.id
    const { addressId } = req.params

    // Check if address belongs to user
    const [existingAddress] = await db.execute(
      `SELECT id, is_default FROM user_addresses WHERE id = ? AND user_id = ?`,
      [addressId, userId],
    )

    if (existingAddress.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    await db.execute(`DELETE FROM user_addresses WHERE id = ? AND user_id = ?`, [addressId, userId])

    // If deleted address was default, set another address as default
    if (existingAddress[0].is_default) {
      await db.execute(
        `UPDATE user_addresses SET is_default = 1 
         WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId],
      )
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    })
  }
}

module.exports = deleteUserAddress
