const db = require("../../config/db")

const getSellerStats = async (req, res) => {
  try {
    const userId = req.user.id

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

    // Get total orders count
    const [totalOrders] = await db.execute(
      `SELECT COUNT(DISTINCT o.id) as total 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'`,
      [sellerId],
    )

    // Get orders this month
    const [monthlyOrders] = await db.execute(
      `SELECT COUNT(DISTINCT o.id) as total 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'
       AND MONTH(o.created_at) = MONTH(CURRENT_DATE()) 
       AND YEAR(o.created_at) = YEAR(CURRENT_DATE())`,
      [sellerId],
    )

    // Get total earnings (sum of seller's order items)
    const [totalEarnings] = await db.execute(
      `SELECT COALESCE(SUM(oi.total_price), 0) as total 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'`,
      [sellerId],
    )

    // Get earnings this month
    const [monthlyEarnings] = await db.execute(
      `SELECT COALESCE(SUM(oi.total_price), 0) as total 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'
       AND MONTH(o.created_at) = MONTH(CURRENT_DATE()) 
       AND YEAR(o.created_at) = YEAR(CURRENT_DATE())`,
      [sellerId],
    )

    // Get earnings this week
    const [weeklyEarnings] = await db.execute(
      `SELECT COALESCE(SUM(oi.total_price), 0) as total 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'
       AND YEARWEEK(o.created_at, 1) = YEARWEEK(CURRENT_DATE(), 1)`,
      [sellerId],
    )

    // Get earnings today
    const [dailyEarnings] = await db.execute(
      `SELECT COALESCE(SUM(oi.total_price), 0) as total 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'
       AND DATE(o.created_at) = CURRENT_DATE()`,
      [sellerId],
    )

    // Get average order value
    const [avgOrderValue] = await db.execute(
      `SELECT COALESCE(AVG(seller_totals.total), 0) as average
       FROM (
         SELECT SUM(oi.total_price) as total
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.seller_id = ? AND o.payment_status = 'paid'
         GROUP BY o.id
       ) as seller_totals`,
      [sellerId],
    )

    // Get pending orders count
    const [pendingOrders] = await db.execute(
      `SELECT COUNT(DISTINCT o.id) as total 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.seller_id = ? AND o.status IN ('pending', 'confirmed', 'preparing')`,
      [sellerId],
    )

    // Get top selling products (last 30 days)
    const [topProducts] = await db.execute(
      `SELECT 
         p.name,
         p.image_keys,
         SUM(oi.quantity) as total_sold,
         SUM(oi.total_price) as total_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'
       AND o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
       GROUP BY p.id, p.name, p.image_keys
       ORDER BY total_sold DESC
       LIMIT 5`,
      [sellerId],
    )

    const stats = {
      totalOrders: totalOrders[0].total,
      monthlyOrders: monthlyOrders[0].total,
      pendingOrders: pendingOrders[0].total,
      totalEarnings: Number.parseFloat(totalEarnings[0].total),
      monthlyEarnings: Number.parseFloat(monthlyEarnings[0].total),
      weeklyEarnings: Number.parseFloat(weeklyEarnings[0].total),
      dailyEarnings: Number.parseFloat(dailyEarnings[0].total),
      averageOrderValue: Number.parseFloat(avgOrderValue[0].average),
      topProducts: topProducts.map((product) => ({
        ...product,
        total_revenue: Number.parseFloat(product.total_revenue),
      })),
    }

    res.status(200).json({
      message: "Seller stats retrieved successfully",
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching seller stats:", error)
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR", details: error.message },
    })
  }
}

module.exports = getSellerStats
