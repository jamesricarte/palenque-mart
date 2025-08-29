const db = require("../../config/db")
const supabase = require("../../config/supabase")

const getSellerTransactions = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status, startDate, endDate } = req.query
    const offset = (page - 1) * limit

    // Get seller ID
    const [sellers] = await db.execute("SELECT id FROM sellers WHERE user_id = ? AND is_active = 1", [userId])

    if (sellers.length === 0) {
      return res.status(404).json({
        message: "Seller profile not found",
        success: false,
        error: { code: "SELLER_NOT_FOUND" },
      })
    }

    const sellerId = sellers[0].id

    // Build query filters
    const whereConditions = ["oi.seller_id = ?"]
    const queryParams = [sellerId]

    if (status && status !== "all") {
      whereConditions.push("o.payment_status = ?")
      queryParams.push(status)
    }

    if (startDate) {
      whereConditions.push("DATE(o.created_at) >= ?")
      queryParams.push(startDate)
    }

    if (endDate) {
      whereConditions.push("DATE(o.created_at) <= ?")
      queryParams.push(endDate)
    }

    const whereClause = whereConditions.join(" AND ")

    // Get transactions with order details
    const [transactions] = await db.execute(
      `SELECT 
         o.id as order_id,
         o.order_number,
         o.status as order_status,
         o.payment_method,
         o.payment_status,
         o.created_at as transaction_date,
         o.updated_at,
         u.first_name as customer_first_name,
         u.last_name as customer_last_name,
         SUM(oi.total_price) as seller_amount,
         COUNT(oi.id) as items_count,
         GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as items_summary
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN users u ON o.user_id = u.id
       JOIN products p ON oi.product_id = p.id
       WHERE ${whereClause}
       GROUP BY o.id, o.order_number, o.status, o.payment_method, o.payment_status, 
                o.created_at, o.updated_at, u.first_name, u.last_name
       ORDER BY o.created_at DESC
       LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      queryParams,
    )

    // Get total count for pagination
    const [countResult] = await db.execute(
      `SELECT COUNT(DISTINCT o.id) as total 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE ${whereClause}`,
      queryParams,
    )

    // Format transactions
    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      seller_amount: Number.parseFloat(transaction.seller_amount),
      transaction_type: "sale", // All current transactions are sales
      description: `Order ${transaction.order_number} - ${transaction.items_summary}`,
    }))

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching seller transactions:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: { code: "FETCH_TRANSACTIONS_ERROR", details: error.message },
    })
  }
}

module.exports = getSellerTransactions
