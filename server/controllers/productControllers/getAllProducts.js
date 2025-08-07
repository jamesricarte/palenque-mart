const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getAllProducts = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.seller_id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.image_keys,
        p.is_active,
        p.created_at,
        p.updated_at,
        s.store_name,
        s.store_description,
        s.account_type,
        s.store_logo_key
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.is_active = 1 AND s.is_active = 1
      ORDER BY p.created_at DESC
    `;

    const [results] = await db.execute(query);

    // Generate public URLs for images
    const productsWithUrls = results.map((product) => {
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

      return {
        ...product,
        image_keys: productImageUrl,
        store_logo_key: storeLogoUrl,
      };
    });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products: productsWithUrls,
        count: productsWithUrls.length,
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

module.exports = getAllProducts;
