const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const {
  upload,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");

// Import controllers
const submitSellerApplication = require("../controllers/sellerControllers/submitSellerApplication");

const getApplicationStatus = require("../controllers/sellerControllers/getApplicationStatus");
const resubmitDocuments = require("../controllers/sellerControllers/resubmitDocuments");
const addProduct = require("../controllers/sellerControllers/addProduct");
const getStoreProfile = require("../controllers/sellerControllers/getStoreProfile");
const updateStoreProfile = require("../controllers/sellerControllers/updateStoreProfile");
const getProducts = require("../controllers/sellerControllers/getProducts");

// Routes
router.post(
  "/submit-application",
  authenticateToken,
  upload,
  handleUploadError,
  submitSellerApplication
);

// Route to get the status of a seller's application
router.get("/application-status", authenticateToken, getApplicationStatus);

// Route for resubmitting documents
router.post(
  "/resubmit-documents",
  authenticateToken,
  upload,
  resubmitDocuments
);

// Route for adding a new product
router.post("/add-product", authenticateToken, upload, addProduct);

// Route to get store profile
router.get("/store-profile", authenticateToken, getStoreProfile);

// Route to update store profile
router.put("/store-profile", authenticateToken, updateStoreProfile);

// Route to get seller's products
router.get("/products", authenticateToken, getProducts);

module.exports = router;
