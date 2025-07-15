const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const getApplicationStatus = require("../controllers/sellerControllers/getApplicationStatus");

const submitSellerApplication = require("../controllers/sellerControllers/submitSellerApplication");

const router = express.Router();

// Seller application submission
router.post("/submit-application", authenticateToken, submitSellerApplication);

// Get seller application status
router.get("/application-status", authenticateToken, getApplicationStatus);

module.exports = router;
