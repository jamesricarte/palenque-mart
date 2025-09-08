const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const getPreOrders = require("../controllers/userControllers/getPreOrders");

router.get("/preorders", authenticateToken, getPreOrders);

module.exports = router;
