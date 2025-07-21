const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const query = `
      SELECT 
        p.id,
        p.seller_id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.subcategory,
        p.unit_type,
        p.freshness_indicator,
        p.harvest_date,
        p.source_origin,
        p.preparation_options,
        p.image_keys,
        p.is_active,
        p.created_at,
        p.updated_at,
        s.store_name,
        s.store_description,
        s.account_type,
        s.store_logo_key,
        s.user_id as seller_user_id,
        sa.pickup_address,
        sa.return_address,
        sa.store_location
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN seller_addresses sa ON s.application_id = sa.application_id
      WHERE p.id = ? AND p.is_active = 1 AND s.is_active = 1
    `;

    const [results] = await db.execute(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = results[0];

    // Generate public URLs for images
    let productImageUrl = null;
    let storeLogoUrl = null;

    // Generate product image URL if image_keys exists
    if (product.image_keys) {
      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(product.image_keys);
      productImageUrl = data?.publicUrl || null;
    }

    // Generate store logo URL if store_logo_key exists
    if (product.store_logo_key) {
      const { data } = supabase.storage
        .from("vendor-assets")
        .getPublicUrl(product.store_logo_key);
      storeLogoUrl = data?.publicUrl || null;
    }

    // Update the product object with the generated URLs
    product.image_keys = productImageUrl;
    product.store_logo_key = storeLogoUrl;

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: {
        product: product,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = getProductById;
