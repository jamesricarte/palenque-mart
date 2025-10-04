const db = require("../../config/db");

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
};

// Calculate delivery fee based on distance
const calculateDeliveryFee = (distanceInKm) => {
  const baseDistance = 5; // 5km
  const baseFee = 30; // ₱30 for distances <= 5km
  const additionalFeePerKm = 5; // ₱5 per km over 5km

  if (distanceInKm <= baseDistance) {
    return baseFee;
  }

  const extraDistance = distanceInKm - baseDistance;
  const additionalFee = Math.ceil(extraDistance) * additionalFeePerKm;
  return baseFee + additionalFee;
};

const calculateDeliveryFees = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deliveryAddressId, sellerIds } = req.body;

    // Validate required fields
    if (
      !deliveryAddressId ||
      !sellerIds ||
      !Array.isArray(sellerIds) ||
      sellerIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery address ID and seller IDs are required",
      });
    }

    // Get user's delivery address with coordinates
    const [addressRows] = await db.execute(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [deliveryAddressId, userId]
    );

    if (addressRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found",
      });
    }

    const userAddress = addressRows[0];

    if (!userAddress.latitude || !userAddress.longitude) {
      return res.status(400).json({
        success: false,
        message: "Delivery address does not have valid coordinates",
      });
    }

    // Get seller pickup addresses with coordinates
    const placeholders = sellerIds.map(() => "?").join(",");
    const [sellerAddressRows] = await db.execute(
      `SELECT sa.*, s.id as seller_id, s.store_name
       FROM seller_addresses sa
       JOIN sellers s ON sa.application_id = s.application_id
       WHERE s.id IN (${placeholders}) AND sa.type = 'pickup'`,
      sellerIds
    );

    if (sellerAddressRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No seller pickup addresses found",
      });
    }

    console.log("\n========== DELIVERY FEE CALCULATION ==========");
    console.log("Calculation Variables:");
    console.log(`  Base Fee: ₱30`);
    console.log(`  Base Distance: 5km`);
    console.log(`  Additional Fee Per Km: ₱5`);
    console.log("==============================================\n");

    // Calculate delivery fee for each seller
    const deliveryFees = {};

    for (const sellerAddress of sellerAddressRows) {
      if (!sellerAddress.latitude || !sellerAddress.longitude) {
        // If seller doesn't have coordinates, use default fee
        deliveryFees[sellerAddress.seller_id] = {
          sellerId: sellerAddress.seller_id,
          storeName: sellerAddress.store_name,
          distance: null,
          deliveryFee: 50.0, // Default fee
          error: "Seller pickup address does not have valid coordinates",
        };
        console.log(`Store: ${sellerAddress.store_name}`);
        console.log(
          `  ⚠️  No coordinates available - Using default fee: ₱50.00\n`
        );
        continue;
      }

      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        Number.parseFloat(userAddress.latitude),
        Number.parseFloat(userAddress.longitude),
        Number.parseFloat(sellerAddress.latitude),
        Number.parseFloat(sellerAddress.longitude)
      );

      // Calculate delivery fee based on distance
      const deliveryFee = calculateDeliveryFee(distance);

      deliveryFees[sellerAddress.seller_id] = {
        sellerId: sellerAddress.seller_id,
        storeName: sellerAddress.store_name,
        distance: Number.parseFloat(distance.toFixed(2)),
        deliveryFee: Number.parseFloat(deliveryFee.toFixed(2)),
      };

      console.log(`Store: ${sellerAddress.store_name}`);
      console.log(`  Distance: ${distance.toFixed(2)} km`);
      console.log(`  Delivery Fee: ₱${deliveryFee.toFixed(2)}`);
      console.log(
        `  Calculation: ${
          distance <= 5
            ? "Base fee (≤5km)"
            : `₱30 + (${Math.ceil(distance - 5)}km × ₱5)`
        }\n`
      );
    }

    const totalFee = Object.values(deliveryFees).reduce(
      (sum, fee) => sum + fee.deliveryFee,
      0
    );
    console.log("==============================================");
    console.log(`Total Delivery Fee: ₱${totalFee.toFixed(2)}`);
    console.log("==============================================\n");

    res.status(200).json({
      success: true,
      data: {
        deliveryFees,
      },
    });
  } catch (error) {
    console.error("Error calculating delivery fees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate delivery fees",
      error: error.message,
    });
  }
};

module.exports = calculateDeliveryFees;
