const db = require("../../config/db")

const getPreOrderDetails = async (req, res) => {
  try {
    const { preOrderId } = req.params
    const userId = req.user.id

    // Get pre-order details with related information
    const [preOrderRows] = await db.execute(
      `SELECT 
        po.*,
        p.name as product_name,
        p.description as product_description,
        p.image_keys as product_image,
        p.unit_type,
        p.category as product_category,
        s.store_name as seller_name,
        s.store_logo_key as seller_logo,
        su.first_name as seller_first_name,
        su.last_name as seller_last_name,
        su.phone as seller_phone,
        cu.first_name as customer_first_name,
        cu.last_name as customer_last_name,
        cu.phone as customer_phone,
        v.title as voucher_title,
        v.code as voucher_code
      FROM pre_orders po
      JOIN products p ON po.product_id = p.id
      JOIN sellers s ON po.seller_id = s.id
      JOIN users su ON s.user_id = su.id
      JOIN users cu ON po.user_id = cu.id
      LEFT JOIN vouchers v ON po.voucher_id = v.id
      WHERE po.id = ? AND (po.user_id = ? OR s.user_id = ?)`,
      [preOrderId, userId, userId],
    )

    if (preOrderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pre-order not found or access denied",
      })
    }

    const preOrder = preOrderRows[0]

    // Get status history
    const [statusHistory] = await db.execute(
      `SELECT posh.*, u.first_name, u.last_name
       FROM pre_order_status_history posh
       LEFT JOIN users u ON posh.updated_by = u.id
       WHERE posh.pre_order_id = ?
       ORDER BY posh.created_at ASC`,
      [preOrderId],
    )

    res.json({
      success: true,
      message: "Pre-order details retrieved successfully",
      data: {
        preOrder,
        statusHistory,
      },
    })
  } catch (error) {
    console.error("Get pre-order details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve pre-order details",
      error: { code: "GET_PRE_ORDER_DETAILS_ERROR" },
    })
  }
}

module.exports = getPreOrderDetails
