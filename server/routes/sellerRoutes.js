const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { uploadFields } = require("../middlewares/uploadMiddleware");
const getApplicationStatus = require("../controllers/sellerControllers/getApplicationStatus");
const submitSellerApplication = require("../controllers/sellerControllers/submitSellerApplication");

const router = express.Router();

// Seller application submission with file upload
router.post(
  "/submit-application",
  authenticateToken,
  uploadFields,
  submitSellerApplication
);

// Get seller application status
router.get("/application-status", authenticateToken, getApplicationStatus);

module.exports = router;
