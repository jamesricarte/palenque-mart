const db = require("../../config/db")

const getUserPreOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const { status, page = 1, limit = 10 } = req.query

    let whereClause = "WHERE po.user_id = ?"
    const queryParams = [userId]

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
        s.store_name as seller_name,
        s.store_logo_key as seller_logo,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name
      FROM pre_orders po
      JOIN products p ON po.product_id = p.id
      JOIN sellers s ON po.seller_id = s.id
      JOIN users u ON s.user_id = u.id
      ${whereClause}
      ORDER BY po.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, Number.parseInt(limit), offset],
    )

    // Get total count
    const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM pre_orders po ${whereClause}`, queryParams)

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    res.json({
      success: true,
      message: "Pre-orders retrieved successfully",
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
    console.error("Get user pre-orders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve pre-orders",
      error: { code: "GET_USER_PRE_ORDERS_ERROR" },
    })
  }
}

module.exports = getUserPreOrders
