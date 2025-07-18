const express = require("express");
const router = express.Router();

// Import middlewares
const authenticateToken = require("../middlewares/authenticateToken");
const {
  upload,
  uploadFields,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");

// Import controllers
const submitSellerApplication = require("../controllers/sellerControllers/submitSellerApplication");
const getApplicationStatus = require("../controllers/sellerControllers/getApplicationStatus");
const resubmitDocuments = require("../controllers/sellerControllers/resubmitDocuments");

// Routes
router.post(
  "/submit-application",
  authenticateToken,
  uploadFields,
  handleUploadError,
  submitSellerApplication
);
router.get("/application-status", authenticateToken, getApplicationStatus);

// Route for resubmitting multiple documents
router.post(
  "/resubmit-documents",
  authenticateToken,
  upload.any(), // Use upload.any() to accept files with various field names
  handleUploadError,
  resubmitDocuments
);

module.exports = router;
