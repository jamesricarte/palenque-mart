const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

// Import controllers
const createOrder = require("../controllers/orderControllers/createOrder");
const getUserOrders = require("../controllers/orderControllers/getUserOrders");
const getOrderDetails = require("../controllers/orderControllers/getOrderDetails");
const validateVoucher = require("../controllers/orderControllers/validateVoucher");

// Routes
router.post("/create", authenticateToken, createOrder);
router.get("/", authenticateToken, getUserOrders);
router.get("/:orderId", authenticateToken, getOrderDetails);
router.post("/validate-voucher", authenticateToken, validateVoucher);

module.exports = router;
