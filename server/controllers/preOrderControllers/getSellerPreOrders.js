const db = require("../../config/db")

const getSellerPreOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const { status, page = 1, limit = 10 } = req.query

    // Get seller ID from user ID
    const [sellerRows] = await db.execute("SELECT id FROM sellers WHERE user_id = ? AND is_active = 1", [userId])

    if (sellerRows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Seller account required.",
      })
    }

    const sellerId = sellerRows[0].id

    let whereClause = "WHERE po.seller_id = ?"
    const queryParams = [sellerId]

    if (status) {
      whereClause += " AND po.status = ?"
      queryParams.push(status)
    }

    const offset = (page - 1) * limit

    const [preOrders] = await db.execute(
      `SELECT 
        po.*,
        p.name as product_name,
        p.image_keys as product_image,
        p.unit_type,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.phone as customer_phone
      FROM pre_orders po
      JOIN products p ON po.product_id = p.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
      ORDER BY po.scheduled_date ASC, po.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, Number.parseInt(limit), offset],
    )

    // Get total count
    const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM pre_orders po ${whereClause}`, queryParams)

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    res.json({
      success: true,
      message: "Seller pre-orders retrieved successfully",
      data: {
        preOrders,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get seller pre-orders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve seller pre-orders",
      error: { code: "GET_SELLER_PRE_ORDERS_ERROR" },
    })
  }
}

module.exports = getSellerPreOrders
