const db = require("../../config/db");

const getSellerAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "7days" } = req.query; // 7days, 30days, 90days, 1year

    // Get seller ID
    const [sellers] = await db.execute(
      "SELECT id FROM sellers WHERE user_id = ? AND is_active = 1",
      [userId]
    );

    if (sellers.length === 0) {
      return res.status(404).json({
        message: "Seller profile not found",
        success: false,
        error: { code: "SELLER_NOT_FOUND" },
      });
    }

    const sellerId = sellers[0].id;

    // Determine date range based on period
    let dateCondition = "";
    let groupBy = "";
    let dateFormat = "";

    switch (period) {
      case "7days":
        dateCondition =
          "AND o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)";
        groupBy = "DATE(o.created_at)";
        dateFormat = "DATE_FORMAT(o.created_at, '%Y-%m-%d')";
        break;
      case "30days":
        dateCondition =
          "AND o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)";
        groupBy = "DATE(o.created_at)";
        dateFormat = "DATE_FORMAT(o.created_at, '%Y-%m-%d')";
        break;
      case "90days":
        dateCondition =
          "AND o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)";
        groupBy = "YEARWEEK(o.created_at, 1)";
        dateFormat =
          "CONCAT(YEAR(o.created_at), '-W', LPAD(WEEK(o.created_at, 1), 2, '0'))";
        break;
      case "1year":
        dateCondition =
          "AND o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)";
        groupBy = "YEAR(o.created_at), MONTH(o.created_at)";
        dateFormat = "DATE_FORMAT(o.created_at, '%Y-%m')";
        break;
      default:
        dateCondition =
          "AND o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)";
        groupBy = "DATE(o.created_at)";
        dateFormat = "DATE_FORMAT(o.created_at, '%Y-%m-%d')";
    }

    // Get revenue over time
    const [revenueData] = await db.execute(
      `SELECT 
         ${dateFormat} as period,
         SUM(oi.total_price) as revenue,
         COUNT(DISTINCT o.id) as orders_count,
         SUM(oi.quantity) as items_sold
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid' ${dateCondition}
       GROUP BY period
       ORDER BY period ASC`,
      [sellerId]
    );

    // Get payment method breakdown
    const [paymentMethods] = await db.execute(
      `SELECT 
         o.payment_method,
         COUNT(DISTINCT o.id) as order_count,
         SUM(oi.total_price) as total_amount
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid' ${dateCondition}
       GROUP BY o.payment_method
       ORDER BY total_amount DESC`,
      [sellerId]
    );

    // Get order status breakdown
    const [orderStatuses] = await db.execute(
      `SELECT 
         o.status,
         COUNT(DISTINCT o.id) as order_count,
         SUM(oi.total_price) as total_amount
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? ${dateCondition}
       GROUP BY o.status
       ORDER BY order_count DESC`,
      [sellerId]
    );

    // Get product category performance
    const [categoryPerformance] = await db.execute(
      `SELECT 
         p.category,
         COUNT(DISTINCT oi.id) as items_sold,
         SUM(oi.total_price) as revenue,
         AVG(oi.total_price) as avg_price
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid' ${dateCondition}
       GROUP BY p.category
       ORDER BY revenue DESC`,
      [sellerId]
    );

    // Format the data
    const analytics = {
      period,
      revenueOverTime: revenueData.map((item) => ({
        period: item.period,
        revenue: Number.parseFloat(item.revenue),
        ordersCount: item.orders_count,
        itemsSold: item.items_sold,
      })),
      paymentMethodBreakdown: paymentMethods.map((item) => ({
        method: item.payment_method,
        orderCount: item.order_count,
        totalAmount: Number.parseFloat(item.total_amount),
        percentage: 0, // Will be calculated on frontend
      })),
      orderStatusBreakdown: orderStatuses.map((item) => ({
        status: item.status,
        orderCount: item.order_count,
        totalAmount: Number.parseFloat(item.total_amount || 0),
      })),
      categoryPerformance: categoryPerformance.map((item) => ({
        category: item.category,
        itemsSold: item.items_sold,
        revenue: Number.parseFloat(item.revenue),
        avgPrice: Number.parseFloat(item.avg_price),
      })),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching seller analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: { code: "FETCH_ANALYTICS_ERROR", details: error.message },
    });
  }
};

module.exports = getSellerAnalytics;
