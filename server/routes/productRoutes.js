const express = require("express");
const {
  getAllProducts,
  getHomeData,
} = require("../controllers/productControllers/getAllProducts");
const getProductById = require("../controllers/productControllers/getProductById");
const getCategories = require("../controllers/productControllers/getCategories");
const {
  getSearchSuggestions,
  searchProducts,
} = require("../controllers/productControllers/searchProducts");

const router = express.Router();

// Get all active products
router.get("/all", getAllProducts);

router.get("/home-data", getHomeData);

router.get("/search-suggestions", getSearchSuggestions);
router.get("/search", searchProducts);

router.get("/categories", getCategories);

// Get product by ID
router.get("/:id", getProductById);

module.exports = router;
