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
const getAvailableDeliveries = require("../controllers/deliveryPartnerControllers/getAvailableDeliveries");
const getDeliveryHistory = require("../controllers/deliveryPartnerControllers/getDeliveryHistory");
const getDeliveryDetails = require("../controllers/deliveryPartnerControllers/getDeliveryDetails");
const toggleOnlineStatus = require("../controllers/deliveryPartnerControllers/toggleOnlineStatus");
const updateLocation = require("../controllers/deliveryPartnerControllers/updateLocation");
const acceptAssignment = require("../controllers/deliveryPartnerControllers/acceptAssignment");
const updateAssignmentStatus = require("../controllers/deliveryPartnerControllers/updateAssignmentStatus");

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
router.get("/available-deliveries", authenticateToken, getAvailableDeliveries);
router.get("/delivery-history", authenticateToken, getDeliveryHistory);
router.get(
  "/delivery-details/:assignmentId",
  authenticateToken,
  getDeliveryDetails
);
router.put("/toggle-online-status", authenticateToken, toggleOnlineStatus);

// New route for updating location
router.put("/update-location", authenticateToken, updateLocation);

// New routes for accepting assignments and updating status
router.post("/accept-assignment", authenticateToken, acceptAssignment);
router.put(
  "/update-assignment-status",
  authenticateToken,
  updateAssignmentStatus
);

module.exports = router;
