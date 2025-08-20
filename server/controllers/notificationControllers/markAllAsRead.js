const db = require("../../config/db");

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update all unread notifications for the user
    const [result] = await db.execute(
      `UPDATE notifications 
      SET is_read = 1, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: `${result.affectedRows} notifications marked as read`,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

module.exports = markAllAsRead;
