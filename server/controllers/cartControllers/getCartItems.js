const db = require("../../config/db")
const supabase = require("../../config/supabase")
const formValidator = require("../../utils/formValidator")

const getCartItems = async (req, res) => {
  const { id: userId } = req.user

  const formValidation = formValidator.validate(req.user)

  if (!formValidation.validation) {
    return res.status(400).json({ message: formValidation.message, success: false })
  }

  try {
    const query = `
      SELECT 
        c.id as cart_id,
        c.quantity,
        c.created_at as added_at,
        p.id as product_id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.category,
        p.unit_type,
        p.image_keys,
        p.is_active,
        s.store_name,
        s.store_logo_key,
        s.user_id as seller_user_id
      FROM cart c
      JOIN products p ON c.product_id = p.id
      JOIN sellers s ON p.seller_id = s.id
      WHERE c.user_id = ? AND p.is_active = 1 AND s.is_active = 1
      ORDER BY c.created_at DESC
    `

    const [results] = await db.execute(query, [userId])

    // Generate public URLs for images
    const cartItemsWithUrls = results.map((item) => {
      let productImageUrl = null
      let storeLogoUrl = null

      // Generate product image URL if image_keys exists
      if (item.image_keys) {
        const { data } = supabase.storage.from("products").getPublicUrl(item.image_keys)
        productImageUrl = data?.publicUrl || null
      }

      // Generate store logo URL if store_logo_key exists
      if (item.store_logo_key) {
        const { data } = supabase.storage.from("vendor-assets").getPublicUrl(item.store_logo_key)
        storeLogoUrl = data?.publicUrl || null
      }

      return {
        ...item,
        image_keys: productImageUrl,
        store_logo_key: storeLogoUrl,
        total_price: (Number.parseFloat(item.price) * item.quantity).toFixed(2),
      }
    })

    // Calculate cart summary
    const totalItems = cartItemsWithUrls.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = cartItemsWithUrls.reduce((sum, item) => sum + Number.parseFloat(item.total_price), 0)

    res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      data: {
        items: cartItemsWithUrls,
        summary: {
          totalItems,
          totalAmount: totalAmount.toFixed(2),
          itemCount: cartItemsWithUrls.length,
        },
      },
    })
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

module.exports = getCartItems
