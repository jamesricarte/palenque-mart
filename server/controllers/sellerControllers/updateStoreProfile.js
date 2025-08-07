const db = require("../../config/db");

const updateStoreProfile = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const { storeName, storeDescription, address } = req.body;

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    // Get a connection from the pool
    connection = await db.getConnection();

    // Check if seller exists
    const [existingRows] = await connection.execute(
      "SELECT id, application_id FROM sellers WHERE user_id = ?",
      [userId]
    );

    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      });
    }

    const sellerId = existingRows[0].id;
    const applicationId = existingRows[0].application_id;

    // Start transaction
    await connection.beginTransaction();

    try {
      // Update seller data
      await connection.execute(
        `UPDATE sellers SET 
          store_name = ?,
          store_description = ?,
          updated_at = ?
        WHERE user_id = ?`,
        [storeName.trim(), storeDescription || "", new Date(), userId]
      );

      // Update addresses if provided
      if (address) {
        const addressTypes = ["pickup", "return", "store"];

        for (const type of addressTypes) {
          const addressKey =
            type === "store" ? `${type}_location` : `${type}_address`;
          const addressData = address[addressKey];

          if (addressData) {
            // Update or insert address
            await connection.execute(
              `INSERT INTO seller_addresses 
                (application_id, type, street_address, barangay, city, province, postal_code, landmark, latitude, longitude, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                street_address = VALUES(street_address),
                barangay = VALUES(barangay),
                city = VALUES(city),
                province = VALUES(province),
                postal_code = VALUES(postal_code),
                landmark = VALUES(landmark),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                updated_at = VALUES(updated_at)`,
              [
                applicationId,
                type,
                addressData.street_address || "",
                addressData.barangay || "",
                addressData.city || "",
                addressData.province || "",
                addressData.postal_code || null,
                addressData.landmark || null,
                addressData.latitude || null,
                addressData.longitude || null,
                new Date(),
              ]
            );
          }
        }
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      // Get updated data for response
      const [updatedRows] = await connection.execute(
        `SELECT 
          s.store_name,
          s.store_description,
          s.account_type,
          s.is_active,
          s.seller_id,
          u.email as contact_email,
          u.phone as contact_phone
        FROM sellers s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?`,
        [userId]
      );

      // Get updated addresses
      const [addressRows] = await connection.execute(
        `SELECT type, street_address, barangay, city, province, postal_code, landmark, latitude, longitude
        FROM seller_addresses 
        WHERE application_id = ?`,
        [applicationId]
      );

      const updatedData = updatedRows[0];

      // Format addresses
      const formattedAddress = {
        pickup_address: null,
        return_address: null,
        store_location: null,
      };

      addressRows.forEach((addr) => {
        const addressObj = {
          street_address: addr.street_address,
          barangay: addr.barangay,
          city: addr.city,
          province: addr.province,
          postal_code: addr.postal_code,
          landmark: addr.landmark,
          latitude: addr.latitude ? addr.latitude.toString() : null,
          longitude: addr.longitude ? addr.longitude.toString() : null,
        };

        if (addr.type === "pickup") {
          formattedAddress.pickup_address = addressObj;
        } else if (addr.type === "return") {
          formattedAddress.return_address = addressObj;
        } else if (addr.type === "store") {
          formattedAddress.store_location = addressObj;
        }
      });

      const responseData = {
        storeName: updatedData.store_name,
        storeDescription: updatedData.store_description,
        accountType: updatedData.account_type,
        contactEmail: updatedData.contact_email,
        contactPhone: updatedData.contact_phone,
        address: formattedAddress,
        isActive: updatedData.is_active,
        sellerId: updatedData.seller_id,
        storeLogoUrl: null,
      };

      res.status(200).json({
        success: true,
        message: "Store profile updated successfully",
        data: responseData,
      });
    } catch (updateError) {
      // Rollback transaction
      await connection.rollback();
      connection.release();
      throw updateError;
    } finally {
      connection.release();
    }
  } catch (error) {
    if (connection) connection.release();
    console.error("Error updating store profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = updateStoreProfile;
