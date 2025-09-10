const express = require("express");
const getAllProducts = require("../controllers/productControllers/getAllProducts");
const getProductById = require("../controllers/productControllers/getProductById");
const getCategories = require("../controllers/productControllers/getCategories");

const router = express.Router();

// Get all active products
router.get("/all", getAllProducts);

router.get("/categories", getCategories);

// Get product by ID
router.get("/:id", getProductById);

module.exports = router;
