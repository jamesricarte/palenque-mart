const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getProductDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

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

    // Get product details for this seller
    const [productRows] = await db.execute(
      `SELECT 
        id,
        name,
        description,
        price,
        stock_quantity,
        category,
        subcategory,
        unit_type,
        freshness_indicator,
        harvest_date,
        source_origin,
        preparation_options,
        image_keys,
        is_active,
        bargaining_enabled,
        minimum_offer_price,
        is_preorder_enabled,
        expected_availability_date,
        preorder_deposit_required,
        preorder_deposit_amount,
        max_preorder_quantity,
        created_at,
        updated_at
      FROM products 
      WHERE id = ? AND seller_id = ?`,
      [productId, sellerId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        message: "Product not found or you don't have permission to access it.",
        success: false,
        error: { code: "PRODUCT_NOT_FOUND" },
      });
    }

    const product = productRows[0];

    // Generate public URL for product image
    let productImageUrl = null;
    if (product.image_keys) {
      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(product.image_keys);
      productImageUrl = data?.publicUrl || null;
    }

    const productWithUrl = {
      ...product,
      image_keys: productImageUrl,
    };

    res.status(200).json({
      message: "Product details retrieved successfully.",
      success: true,
      data: {
        product: productWithUrl,
      },
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({
      message: "Could not fetch product details.",
      success: false,
      error: { code: "FETCH_PRODUCT_DETAILS_ERROR", details: error.message },
    });
  }
};

module.exports = getProductDetails;
