const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getAllVendors = async (req, res) => {
  try {
    const { location, category, search } = req.query;

    // Base query to get all active sellers with their store information
    let vendorsQuery = `
      SELECT 
        s.id,
        s.seller_id,
        s.store_name,
        s.store_description,
        s.store_logo_key,
        s.average_rating,
        s.review_count,
        s.account_type,
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
      WHERE s.is_active = 1
    `;

    const queryParams = [];

    if (search && search.trim()) {
      vendorsQuery += ` AND (s.store_name LIKE ? OR s.store_description LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Add location filter if specified
    if (location && location !== "All") {
      vendorsQuery += ` AND sa.city = ?`;
      queryParams.push(location);
    }

    vendorsQuery += ` ORDER BY s.average_rating DESC, s.review_count DESC`;

    const [vendorsResults] = await db.execute(vendorsQuery, queryParams);

    // Get all available locations (cities) from seller addresses
    const locationsQuery = `
      SELECT DISTINCT sa.city
      FROM seller_addresses sa
      JOIN sellers s ON s.application_id = sa.application_id
      WHERE sa.type = 'store' AND sa.city IS NOT NULL AND s.is_active = 1
      ORDER BY sa.city ASC
    `;

    const [locationsResults] = await db.execute(locationsQuery);
    const availableLocations = locationsResults.map((row) => row.city);

    // Get all available categories from products
    const categoriesQuery = `
      SELECT DISTINCT p.category
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.is_active = 1 AND s.is_active = 1 AND p.category IS NOT NULL
      ORDER BY p.category ASC
    `;

    const [categoriesResults] = await db.execute(categoriesQuery);
    const availableCategories = categoriesResults.map((row) => row.category);

    // For each vendor, get their product categories
    const vendorsWithCategories = await Promise.all(
      vendorsResults.map(async (vendor) => {
        // Get categories for this vendor
        const vendorCategoriesQuery = `
          SELECT DISTINCT p.category
          FROM products p
          WHERE p.seller_id = ? AND p.is_active = 1 AND p.category IS NOT NULL
          ORDER BY p.category ASC
        `;

        const [vendorCategoriesResults] = await db.execute(
          vendorCategoriesQuery,
          [vendor.id]
        );
        const vendorCategories = vendorCategoriesResults.map(
          (row) => row.category
        );

        // Apply category filter if specified
        if (
          category &&
          category !== "All" &&
          !vendorCategories.includes(category)
        ) {
          return null; // Filter out this vendor
        }

        // Get store logo URL
        let storeLogoUrl = null;
        if (vendor.store_logo_key) {
          const { data } = supabase.storage
            .from("vendor-assets")
            .getPublicUrl(vendor.store_logo_key);
          storeLogoUrl = data?.publicUrl || null;
        }

        return {
          id: vendor.id,
          seller_id: vendor.seller_id,
          seller_user_id: vendor.seller_user_id,
          store_name: vendor.store_name,
          store_description: vendor.store_description,
          store_logo_key: storeLogoUrl,
          average_rating: Number.parseFloat(vendor.average_rating) || 5.0,
          review_count: vendor.review_count || 0,
          account_type: vendor.account_type,
          contact: {
            name: `${vendor.first_name || ""} ${vendor.last_name || ""}`.trim(),
            phone: vendor.phone,
          },
          address: {
            street_address: vendor.street_address,
            barangay: vendor.barangay,
            city: vendor.city,
            province: vendor.province,
            postal_code: vendor.postal_code,
            landmark: vendor.landmark,
            full_address: [
              vendor.street_address,
              vendor.barangay,
              vendor.city,
              vendor.province,
            ]
              .filter(Boolean)
              .join(", "),
          },
          city: vendor.city,
          province: vendor.province,
          categories: vendorCategories,
        };
      })
    );

    // Filter out null values (vendors that didn't match category filter)
    const filteredVendors = vendorsWithCategories.filter(
      (vendor) => vendor !== null
    );

    res.status(200).json({
      success: true,
      message: "Vendors retrieved successfully",
      data: {
        vendors: filteredVendors,
        locations: availableLocations,
        categories: availableCategories,
        total: filteredVendors.length,
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = getAllVendors;
