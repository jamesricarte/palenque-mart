const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    // First, get the seller_id for this user
    const [sellerRows] = await db.execute(
      "SELECT id FROM sellers WHERE user_id = ? AND is_active = 1",
      [userId]
    );

    if (sellerRows.length === 0) {
      return res.status(404).json({
        message: "Seller profile not found.",
        success: false,
        error: { code: "SELLER_NOT_FOUND" },
      });
    }

    const sellerId = sellerRows[0].id;

    // Get products for this seller
    const [productRows] = await db.execute(
      `SELECT 
        id,
        name,
        description,
        price,
        stock_quantity,
        category,
        image_keys,
        is_active,
        created_at,
        updated_at
      FROM products 
      WHERE seller_id = ? 
      ORDER BY created_at DESC`,
      [sellerId]
    );

    // Generate public URLs for product images
    const productsWithUrls = productRows.map((product) => {
      let productImageUrl = null;

      // Generate product image URL if image_keys exists
      if (product.image_keys) {
        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(product.image_keys);
        productImageUrl = data?.publicUrl || null;
      }

      return {
        ...product,
        image_keys: productImageUrl,
      };
    });

    res.status(200).json({
      message: "Products retrieved successfully.",
      success: true,
      data: {
        products: productsWithUrls,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Could not fetch products.",
      success: false,
      error: { code: "FETCH_PRODUCTS_ERROR", details: error.message },
    });
  }
};

module.exports = getProducts;
