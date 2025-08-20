const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

const getUserNotifications = require("../controllers/notificationControllers/getUserNotifications");
const markAsRead = require("../controllers/notificationControllers/markAsRead");
const markAllAsRead = require("../controllers/notificationControllers/markAllAsRead");

router.use(authenticateToken);

// Get all notifications for a user
router.get("/user", getUserNotifications);

// Mark a specific notification as read
router.put("/:notificationId/read", markAsRead);

// Mark all notifications as read for a user
router.put("/user/read-all", markAllAsRead);

module.exports = router;
