const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getAllProducts = async (req, res) => {
  try {
    const { category, sortBy, priceRange, minRating } = req.query;

    let query = `
      SELECT 
        p.id,
        p.seller_id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.unit_type,
        p.image_keys,
        p.is_active,
        p.created_at,
        p.updated_at,
        p.average_rating,
        s.store_name,
        s.store_description,
        s.account_type,
        s.store_logo_key,
        s.average_rating as store_rating,
        sa.city,
        sa.province
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      JOIN seller_addresses sa ON s.application_id = sa.application_id
      WHERE p.is_active = 1 AND s.is_active = 1 AND sa.type = 'store'
    `;

    const queryParams = [];

    if (category) {
      query += ` AND p.category = ?`;
      queryParams.push(category);
    }

    // Replace the price range filtering section with:
    if (priceRange && priceRange !== "All") {
      switch (priceRange) {
        case "under50":
          query += ` AND p.price < 50`;
          break;
        case "50to100":
          query += ` AND p.price BETWEEN 50 AND 100`;
          break;
        case "100to200":
          query += ` AND p.price BETWEEN 100 AND 200`;
          break;
        case "over200":
          query += ` AND p.price > 200`;
          break;
      }
    }

    // Add rating filter
    if (minRating) {
      query += ` AND p.average_rating >= ?`;
      queryParams.push(parseFloat(minRating));
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
        case "rating":
          orderBy = ` ORDER BY p.average_rating DESC`;
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

const getHomeData = async (req, res) => {
  try {
    // Get recommended products (highest rated products)
    const recommendedQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock_quantity,
        p.category,
        p.unit_type,
        p.image_keys,
        p.created_at,
        p.updated_at,
        p.average_rating,
        s.user_id as seller_user_id,
        s.store_name,
        s.store_logo_key,
        sa.city,
        sa.province
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      JOIN seller_addresses sa ON s.application_id = sa.application_id
      WHERE p.is_active = 1 AND s.is_active = 1 AND sa.type = 'store'
      ORDER BY p.average_rating DESC, p.created_at DESC
      LIMIT 10
    `;

    // Get suggested products (recent products with good stock)
    const suggestedQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock_quantity,
        p.category,
        p.unit_type,
        p.image_keys,
        p.created_at,
        p.updated_at,
        p.average_rating,
        s.user_id as seller_user_id,
        s.store_name,
        s.store_logo_key,
        sa.city,
        sa.province
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      JOIN seller_addresses sa ON s.application_id = sa.application_id
      WHERE p.is_active = 1 AND s.is_active = 1 AND p.stock_quantity > 5 AND sa.type = 'store'
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    // Get top vendors (highest rated sellers)
    const vendorsQuery = `
    SELECT 
      s.id,
      s.store_name,
      s.store_logo_key,
      s.store_description,
      s.average_rating,
      s.weekday_opening_time,
      s.weekday_closing_time,
      s.weekend_opening_time,
      s.weekend_closing_time,
      sa.city,
      sa.province,
      GROUP_CONCAT(DISTINCT p.category) as categories
    FROM sellers s
    JOIN seller_addresses sa ON s.application_id = sa.application_id
    LEFT JOIN products p ON s.id = p.seller_id AND p.is_active = 1
    WHERE s.is_active = 1 AND sa.type = 'store'
    GROUP BY s.id, s.store_name, s.store_logo_key, s.store_description, s.average_rating, s.weekday_opening_time, s.weekday_closing_time, s.weekend_opening_time, s.weekend_closing_time, sa.city, sa.province
    ORDER BY s.average_rating DESC, s.created_at DESC
    LIMIT 8
  `;

    const [recommendedResults] = await db.execute(recommendedQuery);
    const [suggestedResults] = await db.execute(suggestedQuery);
    const [vendorsResults] = await db.execute(vendorsQuery);

    // Process image URLs for products
    const processProductImages = (products) => {
      return products.map((product) => {
        let productImageUrl = null;
        let storeLogoUrl = null;

        if (product.image_keys) {
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(product.image_keys);
          productImageUrl = data?.publicUrl || null;
        }

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
    };

    const recommendedProducts = processProductImages(recommendedResults);
    const suggestedProducts = processProductImages(suggestedResults);
    const vendorsResultsWithUrl = vendorsResults.map((vendor) => {
      let storeLogoUrl = null;

      if (vendor.store_logo_key) {
        const { data } = supabase.storage
          .from("vendor-assets")
          .getPublicUrl(vendor.store_logo_key);
        storeLogoUrl = data?.publicUrl || null;
      }

      return {
        ...vendor,
        store_logo_key: storeLogoUrl,
        categories: vendor.categories ? vendor.categories.split(",") : [],
      };
    });

    res.status(200).json({
      success: true,
      message: "Home data fetched successfully",
      data: {
        recommendedProducts,
        suggestedProducts,
        topVendors: vendorsResultsWithUrl,
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

module.exports = { getAllProducts, getHomeData };
