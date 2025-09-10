const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getAllProducts = async (req, res) => {
  try {
    const { category, sortBy } = req.query;

    let query = `
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
    `;

    const queryParams = [];
    if (category) {
      query += ` AND p.category = ?`;
      queryParams.push(category);
    }

    let orderBy = ` ORDER BY p.created_at DESC`; // default sorting

    if (sortBy) {
      switch (sortBy) {
        case "newest":
          orderBy = ` ORDER BY p.created_at DESC`;
          break;
        case "oldest":
          orderBy = ` ORDER BY p.created_at ASC`;
          break;
        case "price_low":
          orderBy = ` ORDER BY p.price ASC`;
          break;
        case "price_high":
          orderBy = ` ORDER BY p.price DESC`;
          break;
        case "name_asc":
          orderBy = ` ORDER BY p.name ASC`;
          break;
        case "name_desc":
          orderBy = ` ORDER BY p.name DESC`;
          break;
        default:
          orderBy = ` ORDER BY p.created_at DESC`;
      }
    }

    query += orderBy;

    const [results] = await db.execute(query, queryParams);

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
