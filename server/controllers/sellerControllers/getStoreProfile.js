const db = require("../../config/db");

const getStoreProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get seller data from sellers table (live data)
    const [sellerRows] = await db.execute(
      `SELECT 
        s.id as seller_id,
        s.seller_id,
        s.account_type,
        s.store_name,
        s.store_description,
        s.store_logo_key,
        s.is_active,
        s.application_id,
        u.email as contact_email,
        u.phone as contact_phone
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?`,
      [userId]
    );

    if (sellerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      });
    }

    const sellerData = sellerRows[0];

    // Get address data from seller_addresses table
    const [addressRows] = await db.execute(
      `SELECT 
        pickup_address,
        return_address,
        store_location
      FROM seller_addresses 
      WHERE application_id = ?`,
      [sellerData.application_id]
    );

    const addressData =
      addressRows.length > 0
        ? addressRows[0]
        : {
            pickup_address: "",
            return_address: "",
            store_location: "",
          };

    // Prepare response data
    const responseData = {
      storeName: sellerData.store_name || "",
      storeDescription: sellerData.store_description || "",
      accountType: sellerData.account_type || "",
      contactEmail: sellerData.contact_email || "",
      contactPhone: sellerData.contact_phone || "",
      pickupAddress: addressData.pickup_address || "",
      returnAddress: addressData.return_address || "",
      storeLocation: addressData.store_location || "",
      isActive: sellerData.is_active || 0,
      sellerId: sellerData.seller_id || "",
    };

    res.status(200).json({
      success: true,
      message: "Store profile retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching store profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = getStoreProfile;
