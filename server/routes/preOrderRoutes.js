const express = require("express")
const router = express.Router()
const authenticateToken = require("../middlewares/authenticateToken")

// Import pre-order controllers
const createPreOrder = require("../controllers/preOrderControllers/createPreOrder")
const getUserPreOrders = require("../controllers/preOrderControllers/getUserPreOrders")
const getSellerPreOrders = require("../controllers/preOrderControllers/getSellerPreOrders")
const updatePreOrderStatus = require("../controllers/preOrderControllers/updatePreOrderStatus")
const cancelPreOrder = require("../controllers/preOrderControllers/cancelPreOrder")
const getPreOrderDetails = require("../controllers/preOrderControllers/getPreOrderDetails")
const updatePreOrderPayment = require("../controllers/preOrderControllers/updatePreOrderPayment")

// User routes
router.post("/create", authenticateToken, createPreOrder)
router.get("/user", authenticateToken, getUserPreOrders)
router.get("/:preOrderId", authenticateToken, getPreOrderDetails)
router.put("/:preOrderId/cancel", authenticateToken, cancelPreOrder)
router.put("/:preOrderId/payment", authenticateToken, updatePreOrderPayment)

// Seller routes
router.get("/seller/list", authenticateToken, getSellerPreOrders)
router.put("/:preOrderId/status", authenticateToken, updatePreOrderStatus)

module.exports = router
