const db = require("../../config/db")

const updateUserAddress = async (req, res) => {
  try {
    const userId = req.user.id
    const { addressId } = req.params
    const {
      address_type,
      recipient_name,
      phone_number,
      street_address,
      barangay,
      city,
      province,
      postal_code,
      landmark,
      is_default,
    } = req.body

    // Check if address belongs to user
    const [existingAddress] = await db.execute(`SELECT id FROM user_addresses WHERE id = ? AND user_id = ?`, [
      addressId,
      userId,
    ])

    if (existingAddress.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    // If this is set as default, remove default from other addresses
    if (is_default) {
      await db.execute(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND id != ?`, [userId, addressId])
    }

    await db.execute(
      `UPDATE user_addresses SET 
       address_type = ?, recipient_name = ?, phone_number = ?, 
       street_address = ?, barangay = ?, city = ?, province = ?, 
       postal_code = ?, landmark = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        address_type,
        recipient_name,
        phone_number,
        street_address,
        barangay,
        city,
        province,
        postal_code,
        landmark,
        is_default,
        addressId,
        userId,
      ],
    )

    res.json({
      success: true,
      message: "Address updated successfully",
    })
  } catch (error) {
    console.error("Error updating user address:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update address",
    })
  }
}

module.exports = updateUserAddress
