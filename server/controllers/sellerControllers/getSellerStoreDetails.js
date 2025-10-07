const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getSellerStoreDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    // Get seller store information with address
    const storeQuery = `
      SELECT 
        s.id,
        s.seller_id,
        s.store_name,
        s.store_description,
        s.store_logo_key,
        s.average_rating,
        s.review_count,
        s.account_type,
        s.weekday_opening_time,
        s.weekday_closing_time,
        s.weekend_opening_time,
        s.weekend_closing_time,
        u.id as seller_user_id,
        u.first_name,
        u.last_name,
        u.phone,
        sa.street_address,
        sa.barangay,
        sa.city,
        sa.province,
        sa.postal_code,
        sa.landmark
      FROM sellers s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN seller_addresses sa ON s.application_id = sa.application_id AND sa.type = 'store'
      WHERE s.id = ?
    `;

    const [storeResults] = await db.execute(storeQuery, [sellerId]);

    if (storeResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const store = storeResults[0];

    // Get store products with categories
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.subcategory,
        p.unit_type,
        p.image_keys,
        p.average_rating,
        p.review_count,
        p.created_at,
        p.is_preorder_enabled,
        p.expected_availability_date
      FROM products p
      WHERE p.seller_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
    `;

    const [productsResults] = await db.execute(productsQuery, [sellerId]);

    // Get unique categories from products
    const categories = [
      ...new Set(productsResults.map((p) => p.category).filter(Boolean)),
    ];

    let storeLogoUrl = null;
    if (store.store_logo_key) {
      const { data } = supabase.storage
        .from("vendor-assets")
        .getPublicUrl(store.store_logo_key);
      storeLogoUrl = data?.publicUrl || null;
    }

    const productsWithUrls = productsResults.map((product) => {
      let productImageUrl = null;

      if (product.image_keys) {
        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(product.image_keys);
        productImageUrl = data?.publicUrl || null;
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number.parseFloat(product.price),
        stock_quantity: product.stock_quantity,
        category: product.category,
        subcategory: product.subcategory,
        unit_type: product.unit_type,
        image_keys: productImageUrl, // Now contains full public URL
        average_rating: Number.parseFloat(product.average_rating) || 0,
        review_count: product.review_count || 0,
        created_at: product.created_at,
        is_preorder_enabled: product.is_preorder_enabled,
        expected_availability_date: product.expected_availability_date,
      };
    });

    // Format the response
    const storeDetails = {
      id: store.id,
      seller_id: store.seller_id,
      seller_user_id: store.seller_user_id,
      store_name: store.store_name,
      store_description: store.store_description,
      store_logo_key: storeLogoUrl,
      average_rating: Number.parseFloat(store.average_rating) || 0,
      review_count: store.review_count || 0,
      account_type: store.account_type,
      weekday_opening_time: store.weekday_opening_time,
      weekday_closing_time: store.weekday_closing_time,
      weekend_opening_time: store.weekend_opening_time,
      weekend_closing_time: store.weekend_closing_time,
      contact: {
        name: `${store.first_name || ""} ${store.last_name || ""}`.trim(),
        phone: store.phone,
      },
      address: {
        street_address: store.street_address,
        barangay: store.barangay,
        city: store.city,
        province: store.province,
        postal_code: store.postal_code,
        landmark: store.landmark,
        full_address: [
          store.street_address,
          store.barangay,
          store.city,
          store.province,
        ]
          .filter(Boolean)
          .join(", "),
      },
      categories: categories,
      products: productsWithUrls,
    };

    res.status(200).json({
      success: true,
      message: "Store details retrieved successfully",
      data: storeDetails,
    });
  } catch (error) {
    console.error("Error fetching store details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = getSellerStoreDetails;
