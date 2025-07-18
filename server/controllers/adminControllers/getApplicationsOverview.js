const db = require("../../config/db");

const getApplicationsOverview = async (req, res) => {
  try {
    // Get seller applications statistics
    const [sellerStats] = await db.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM seller_applications 
      GROUP BY status
    `);

    // Get delivery partner applications statistics
    const [deliveryStats] = await db.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM delivery_partner_applications 
      GROUP BY status
    `);

    // Get recent applications (last 7 days)
    const [recentSeller] = await db.execute(`
      SELECT COUNT(*) as count
      FROM seller_applications 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const [recentDelivery] = await db.execute(`
      SELECT COUNT(*) as count
      FROM delivery_partner_applications 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Format statistics
    const formatStats = (stats) => {
      const result = {
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        needs_resubmission: 0,
      };
      stats.forEach((stat) => {
        if (result.hasOwnProperty(stat.status)) {
          result[stat.status] = stat.count;
        }
      });
      return result;
    };

    res.status(200).json({
      message: "Overview retrieved successfully",
      success: true,
      data: {
        seller: {
          stats: formatStats(sellerStats),
          total: sellerStats.reduce((sum, stat) => sum + stat.count, 0),
          recentApplications: recentSeller[0].count,
        },
        deliveryPartner: {
          stats: formatStats(deliveryStats),
          total: deliveryStats.reduce((sum, stat) => sum + stat.count, 0),
          recentApplications: recentDelivery[0].count,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching applications overview:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching overview.",
      success: false,
      error: { code: "FETCH_ERROR" },
    });
  }
};

module.exports = getApplicationsOverview;
