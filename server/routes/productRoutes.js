const express = require("express");
const getAllProducts = require("../controllers/productControllers/getAllProducts");

const router = express.Router();

// GET /api/products/all - Get all active products
router.get("/all", getAllProducts);

module.exports = router;
