const express = require("express");
const getAllProducts = require("../controllers/productControllers/getAllProducts");
const getProductById = require("../controllers/productControllers/getProductById");

const router = express.Router();

// GET /api/products/all - Get all active products
router.get("/all", getAllProducts);

// GET /api/products/:id - Get product by ID
router.get("/:id", getProductById);

module.exports = router;
