const express = require("express");
const router = express.Router();

// Import middlewares
const authenticateToken = require("../middlewares/authenticateToken");
const {
  uploadFields,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");

// Import controllers
const submitSellerApplication = require("../controllers/sellerControllers/submitSellerApplication");
const getApplicationStatus = require("../controllers/sellerControllers/getApplicationStatus");

// Routes
router.post(
  "/submit-application",
  authenticateToken,
  uploadFields,
  handleUploadError,
  submitSellerApplication
);
router.get("/application-status", authenticateToken, getApplicationStatus);

module.exports = router;
