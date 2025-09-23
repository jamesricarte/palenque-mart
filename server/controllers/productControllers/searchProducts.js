const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] },
      });
    }

    const searchTerm = `%${q.trim()}%`;

    // Get suggestions from product names, categories, and store names
    const query = `
      SELECT DISTINCT 
        p.name as suggestion,
        'product' as type
      FROM products p
      WHERE p.name LIKE ? AND p.is_active = 1
      UNION
      SELECT DISTINCT 
        p.category as suggestion,
        'category' as type
      FROM products p
      WHERE p.category LIKE ? AND p.is_active = 1 AND p.category IS NOT NULL
      UNION
      SELECT DISTINCT 
        s.store_name as suggestion,
        'store' as type
      FROM sellers s
      WHERE s.store_name LIKE ? AND s.is_active = 1
      LIMIT 8
    `;

    const [results] = await db.execute(query, [
      searchTerm,
      searchTerm,
      searchTerm,
    ]);

    const suggestions = results.map((row) => row.suggestion);

    res.status(200).json({
      success: true,
      data: { suggestions },
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

const searchProducts = async (req, res) => {
  try {
    const { q, category, priceRange, sortBy, rating } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        data: { products: [] },
      });
    }

    const searchTerm = `%${q.trim()}%`;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.unit_type,
        p.image_keys,
        p.average_rating,
        p.created_at,
        s.store_name,
        s.store_logo_key,
        sa.city,
        sa.province
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      JOIN seller_addresses sa ON s.application_id = sa.application_id
      WHERE p.is_active = 1 AND s.is_active = 1 AND sa.type = 'store'
      AND (
        p.name LIKE ? OR 
        p.description LIKE ? OR 
        p.category LIKE ? OR 
        s.store_name LIKE ?
      )
    `;

    const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm];

    // Add category filter
    if (category && category !== "All") {
      query += ` AND p.category = ?`;
      queryParams.push(category);
    }

    // Add price range filter
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

    if (rating && rating !== "All") {
      switch (rating) {
        case "4plus":
          query += ` AND p.average_rating >= 4.0`;
          break;
        case "3plus":
          query += ` AND p.average_rating >= 3.0`;
          break;
        case "2plus":
          query += ` AND p.average_rating >= 2.0`;
          break;
      }
    }

    // Add sorting
    let orderBy = ` ORDER BY p.created_at DESC`; // default
    if (sortBy) {
      switch (sortBy) {
        case "relevance":
          orderBy = ` ORDER BY 
            CASE 
              WHEN p.name LIKE ? THEN 1
              WHEN s.store_name LIKE ? THEN 2
              WHEN p.category LIKE ? THEN 3
              ELSE 4
            END, p.average_rating DESC`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
          break;
        case "price_low":
          orderBy = ` ORDER BY p.price ASC`;
          break;
        case "price_high":
          orderBy = ` ORDER BY p.price DESC`;
          break;
        case "rating":
          orderBy = ` ORDER BY p.average_rating DESC`;
          break;
        case "newest":
          orderBy = ` ORDER BY p.created_at DESC`;
          break;
        case "stock_high":
          orderBy = ` ORDER BY p.stock_quantity DESC`;
          break;
        case "stock_low":
          orderBy = ` ORDER BY p.stock_quantity ASC`;
          break;
      }
    }

    query += orderBy + ` LIMIT 50`;

    const [results] = await db.execute(query, queryParams);

    // Process image URLs
    const productsWithUrls = results.map((product) => {
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

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        products: productsWithUrls,
        count: productsWithUrls.length,
        query: q,
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

module.exports = { getSearchSuggestions, searchProducts };
