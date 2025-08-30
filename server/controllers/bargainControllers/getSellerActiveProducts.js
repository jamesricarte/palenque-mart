const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getSellerActiveProducts = async (req, res) => {
  try {
    const { sellerId, conversationId } = req.params;

    // Get seller's active products excluding those with ongoing bargains
    const [products] = await db.execute(
      `SELECT p.id, p.name, p.price, p.image_keys, p.stock_quantity, p.bargaining_enabled
       FROM products p
       WHERE p.seller_id = ? 
         AND p.is_active = 1 
         AND p.stock_quantity > 0
         AND p.bargaining_enabled = 1
         AND p.id NOT IN (
           SELECT DISTINCT product_id 
           FROM bargain_offers 
           WHERE conversation_id = ? AND status = 'pending'
         )
       ORDER BY p.created_at DESC`,
      [sellerId, conversationId]
    );

    const productsWithImages = products.map((product) => {
      let imageUrl = null;

      if (product.image_keys) {
        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(product.image_keys);
        imageUrl = data?.publicUrl || null;
      }

      return {
        ...product,
        imageUrl,
      };
    });

    res.json({
      success: true,
      data: productsWithImages,
    });
  } catch (error) {
    console.error("Error fetching seller active products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller products",
    });
  }
};

module.exports = getSellerActiveProducts;
