const db = require("../../config/db");

const updateStoreProfile = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const {
      storeName,
      storeDescription,
      pickupAddress,
      returnAddress,
      storeLocation,
    } = req.body;

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
    await connection.query("START TRANSACTION");

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

      // Update address data
      await connection.execute(
        `UPDATE seller_addresses SET 
          pickup_address = ?,
          return_address = ?,
          store_location = ?,
          updated_at = ?
        WHERE application_id = ?`,
        [
          pickupAddress || "",
          returnAddress || "",
          storeLocation || "",
          new Date(),
          applicationId,
        ]
      );

      // Commit transaction
      await connection.query("COMMIT");

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

      const [updatedAddressRows] = await connection.execute(
        `SELECT pickup_address, return_address, store_location
        FROM seller_addresses 
        WHERE application_id = ?`,
        [applicationId]
      );

      const updatedData = updatedRows[0];
      const updatedAddress = updatedAddressRows[0] || {};

      const responseData = {
        storeName: updatedData.store_name,
        storeDescription: updatedData.store_description,
        accountType: updatedData.account_type,
        contactEmail: updatedData.contact_email,
        contactPhone: updatedData.contact_phone,
        pickupAddress: updatedAddress.pickup_address || "",
        returnAddress: updatedAddress.return_address || "",
        storeLocation: updatedAddress.store_location || "",
        isActive: updatedData.is_active,
        sellerId: updatedData.seller_id,
      };

      res.status(200).json({
        success: true,
        message: "Store profile updated successfully",
        data: responseData,
      });
    } catch (updateError) {
      // Rollback transaction
      await connection.query("ROLLBACK");
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
