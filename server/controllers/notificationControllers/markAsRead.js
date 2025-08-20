const db = require("../../config/db")

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    // Update notification to mark as read
    const [result] = await db.execute(
      `UPDATE notifications 
      SET is_read = 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [notificationId],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    })
  }
}

module.exports = markAsRead
