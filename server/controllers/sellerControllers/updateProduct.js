const db = require("../../config/db");

const updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const {
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
      is_active,
      bargaining_enabled,
      minimum_offer_price,
      is_preorder_enabled,
      expected_availability_date,
      preorder_deposit_required,
      preorder_deposit_amount,
      max_preorder_quantity,
    } = req.body;

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

    // Check if product exists and belongs to this seller
    const [productCheck] = await db.execute(
      "SELECT id FROM products WHERE id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (productCheck.length === 0) {
      return res.status(404).json({
        message: "Product not found or you don't have permission to update it.",
        success: false,
        error: { code: "PRODUCT_NOT_FOUND" },
      });
    }

    // Validate expected_availability_date if preorder is enabled
    if (is_preorder_enabled && expected_availability_date) {
      const availabilityDate = new Date(expected_availability_date);
      const currentDate = new Date();

      if (availabilityDate < currentDate) {
        return res.status(400).json({
          message: "Expected availability date cannot be in the past.",
          success: false,
          error: { code: "INVALID_AVAILABILITY_DATE" },
        });
      }
    }

    // Parse preparation options if provided
    let preparationOptionsJson = null;
    if (preparation_options) {
      try {
        preparationOptionsJson =
          typeof preparation_options === "string"
            ? JSON.parse(preparation_options)
            : preparation_options;
      } catch (error) {
        console.error("Error parsing preparation options:", error);
      }
    }

    // Update product
    await db.execute(
      `UPDATE products SET 
        name = ?,
        description = ?,
        price = ?,
        stock_quantity = ?,
        category = ?,
        subcategory = ?,
        unit_type = ?,
        freshness_indicator = ?,
        harvest_date = ?,
        source_origin = ?,
        preparation_options = ?,
        is_active = ?,
        bargaining_enabled = ?,
        minimum_offer_price = ?,
        is_preorder_enabled = ?,
        expected_availability_date = ?,
        preorder_deposit_required = ?,
        preorder_deposit_amount = ?,
        max_preorder_quantity = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND seller_id = ?`,
      [
        name,
        description,
        price,
        stock_quantity,
        category,
        subcategory || null,
        unit_type,
        freshness_indicator || null,
        harvest_date || null,
        source_origin || null,
        preparationOptionsJson ? JSON.stringify(preparationOptionsJson) : null,
        is_active,
        bargaining_enabled !== undefined ? bargaining_enabled : 1,
        minimum_offer_price || null,
        is_preorder_enabled || 0,
        expected_availability_date
          ? formatDateForMySQL(expected_availability_date)
          : null,
        preorder_deposit_required || 0,
        preorder_deposit_amount || null,
        max_preorder_quantity || null,
        productId,
        sellerId,
      ]
    );

    res.status(200).json({
      message: "Product updated successfully.",
      success: true,
      data: {
        productId: Number.parseInt(productId),
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Could not update product.",
      success: false,
      error: { code: "UPDATE_PRODUCT_ERROR", details: error.message },
    });
  }

  function formatDateForMySQL(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const pad = (n) => (n < 10 ? "0" + n : n);

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  }
};

module.exports = updateProduct;
