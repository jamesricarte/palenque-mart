const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getStoreProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get seller data from sellers table (live data)
    const [sellerRows] = await db.execute(
      `SELECT 
        s.id,
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

    // Get address details with new structure
    const [addresses] = await db.execute(
      "SELECT type, street_address, barangay, city, province, postal_code, landmark, latitude, longitude FROM seller_addresses WHERE application_id = ?",
      [sellerData.application_id]
    );

    // Transform addresses into object-based structure
    const addressData = {
      pickup_address: {},
      return_address: {},
      store_location: {},
    };

    addresses.forEach((addr) => {
      const addressKey =
        addr.type === "pickup"
          ? "pickup_address"
          : addr.type === "return"
          ? "return_address"
          : "store_location";

      addressData[addressKey] = {
        street_address: addr.street_address,
        barangay: addr.barangay,
        city: addr.city,
        province: addr.province,
        postal_code: addr.postal_code,
        landmark: addr.landmark,
        latitude: addr.latitude,
        longitude: addr.longitude,
      };
    });

    // Prepare response data
    const responseData = {
      storeName: sellerData.store_name || "",
      storeDescription: sellerData.store_description || "",
      accountType: sellerData.account_type || "",
      contactEmail: sellerData.contact_email || "",
      contactPhone: sellerData.contact_phone || "",
      address: addressData,
      isActive: sellerData.is_active || 0,
      id: sellerData.id || "",
      sellerId: sellerData.seller_id || "",
      storeLogoUrl: sellerData.store_logo_key
        ? supabase.storage
            .from("vendor-assets")
            .getPublicUrl(sellerData.store_logo_key).data.publicUrl
        : null,
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
