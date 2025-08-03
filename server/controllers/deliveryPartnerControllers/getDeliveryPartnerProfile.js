const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getDeliveryPartnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get delivery partner details
    const [deliveryPartners] = await db.execute(
      `SELECT 
        dp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.birth_date,
        u.gender
      FROM delivery_partners dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.user_id = ? AND dp.is_active = 1
      ORDER BY dp.created_at DESC
      LIMIT 1`,
      [userId]
    );

    if (deliveryPartners.length === 0) {
      return res.status(404).json({
        message: "Delivery partner profile not found",
        success: false,
        error: { code: "PROFILE_NOT_FOUND" },
      });
    }

    const deliveryPartner = deliveryPartners[0];

    // Parse JSON fields
    if (deliveryPartner.service_areas) {
      try {
        deliveryPartner.service_areas = JSON.parse(
          deliveryPartner.service_areas
        );
      } catch (e) {
        deliveryPartner.service_areas = [];
      }
    }

    if (deliveryPartner.availability_hours) {
      try {
        deliveryPartner.availability_hours = JSON.parse(
          deliveryPartner.availability_hours
        );
      } catch (e) {
        deliveryPartner.availability_hours = {};
      }
    }

    // Get profile picture public URL if exists
    if (deliveryPartner.profile_picture) {
      try {
        const { data: publicUrlData } = supabase.storage
          .from("delivery-partner-assets")
          .getPublicUrl(deliveryPartner.profile_picture);

        if (publicUrlData?.publicUrl) {
          deliveryPartner.profile_picture_url = publicUrlData.publicUrl;
        }
      } catch (error) {
        console.error("Error getting profile picture URL:", error);
        // Continue without profile picture URL
      }
    }

    res.status(200).json({
      message: "Delivery partner profile retrieved successfully",
      success: true,
      data: deliveryPartner,
    });
  } catch (error) {
    console.error("Error fetching delivery partner profile:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = getDeliveryPartnerProfile;
