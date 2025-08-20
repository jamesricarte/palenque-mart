const db = require("../../config/db");

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, filter } = req.query;

    let whereClause = "WHERE user_id = ?";
    const queryParams = [userId];

    if (filter === "unread") {
      whereClause += " AND is_read = 0";
    } else if (filter === "read") {
      whereClause += " AND is_read = 1";
    }

    const [notifications] = await db.execute(
      `SELECT 
        id,
        user_id,
        title,
        message,
        type,
        reference_id,
        reference_type,
        action,
        deep_link,
        extra_data,
        is_read,
        created_at,
        updated_at
      FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${Number.parseInt(limit)} OFFSET ${Number.parseInt(offset)}`,
      queryParams
    );

    const processedNotifications = notifications.map((notification) => ({
      ...notification,
      extra_data:
        typeof notification.extra_data === "string"
          ? JSON.parse(notification.extra_data)
          : notification.extra_data,
    }));

    // Get unread count
    const [unreadResult] = await db.execute(
      `SELECT COUNT(*) as unread_count 
      FROM notifications 
      WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    const [totalResult] = await db.execute(
      `SELECT COUNT(*) as total_count 
      FROM notifications 
      WHERE user_id = ?`,
      [userId]
    );

    const unreadCount = unreadResult[0]?.unread_count || 0;
    const totalCount = totalResult[0]?.total_count || 0;

    res.status(200).json({
      success: true,
      notifications: processedNotifications,
      unreadCount,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        total: totalCount,
        returned: processedNotifications.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

module.exports = getUserNotifications;
