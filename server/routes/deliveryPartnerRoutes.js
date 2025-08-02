const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const {
  upload,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");

// Import controllers
const submitDeliveryPartnerApplication = require("../controllers/deliveryPartnerControllers/submitDeliveryPartnerApplication");
const getApplicationStatus = require("../controllers/deliveryPartnerControllers/getApplicationStatus");
const resubmitDocuments = require("../controllers/deliveryPartnerControllers/resubmitDocuments");
const getDeliveryPartnerProfile = require("../controllers/deliveryPartnerControllers/getDeliveryPartnerProfile");
const updateDeliveryPartnerProfile = require("../controllers/deliveryPartnerControllers/updateDeliveryPartnerProfile");
const getDeliveryPartnerStats = require("../controllers/deliveryPartnerControllers/getDeliveryPartnerStats");
const getAvailableOrders = require("../controllers/deliveryPartnerControllers/getAvailableOrders");
const getDeliveryHistory = require("../controllers/deliveryPartnerControllers/getDeliveryHistory");
const toggleOnlineStatus = require("../controllers/deliveryPartnerControllers/toggleOnlineStatus");

// Application routes
router.post(
  "/submit-application",
  authenticateToken,
  upload,
  handleUploadError,
  submitDeliveryPartnerApplication
);
router.get("/application-status", authenticateToken, getApplicationStatus);
router.post(
  "/resubmit-documents",
  authenticateToken,
  upload,
  resubmitDocuments
);

// Dashboard routes
router.get("/profile", authenticateToken, getDeliveryPartnerProfile);
router.put("/profile", authenticateToken, updateDeliveryPartnerProfile);
router.get("/stats", authenticateToken, getDeliveryPartnerStats);
router.get("/available-orders", authenticateToken, getAvailableOrders);
router.get("/delivery-history", authenticateToken, getDeliveryHistory);
router.put("/toggle-online-status", authenticateToken, toggleOnlineStatus);

module.exports = router;
