const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const requireAdmin = require("../middlewares/requireAdmin");

const getApplicationsOverview = require("../controllers/adminControllers/getApplicationsOverview");
const getSellerApplications = require("../controllers/adminControllers/getSellerApplications");
const getSellerApplicationDetails = require("../controllers/adminControllers/getSellerApplicationDetails");
const reviewSellerApplication = require("../controllers/adminControllers/reviewSellerApplication");
const getDeliveryPartnerApplications = require("../controllers/adminControllers/getDeliveryPartnerApplications");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard overview
router.get("/overview", getApplicationsOverview);

// Seller applications
router.get("/seller-applications", getSellerApplications);
router.get("/seller-applications/:applicationId", getSellerApplicationDetails);
router.post(
  "/seller-applications/:applicationId/review",
  reviewSellerApplication
);

// Delivery partner applications
router.get("/delivery-partner-applications", getDeliveryPartnerApplications);

module.exports = router;
