const db = require("../../config/db");

const addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      address_type = "home",
      recipient_name,
      phone_number,
      street_address,
      barangay,
      city,
      province,
      postal_code,
      landmark,
      is_default = false,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (
      !recipient_name ||
      !phone_number ||
      !street_address ||
      !barangay ||
      !city ||
      !province
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required address fields",
      });
    }

    // If this is set as default, remove default from other addresses
    if (is_default) {
      await db.execute(
        `UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`,
        [userId]
      );
    }

    const [result] = await db.execute(
      `INSERT INTO user_addresses 
       (user_id, address_type, recipient_name, phone_number, street_address, 
        barangay, city, province, postal_code, landmark, is_default, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
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
        latitude,
        longitude,
      ]
    );

    res.json({
      success: true,
      message: "Address added successfully",
      data: { addressId: result.insertId },
    });
  } catch (error) {
    console.error("Error adding user address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

module.exports = addUserAddress;
