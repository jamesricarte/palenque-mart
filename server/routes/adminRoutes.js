const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const requireAdmin = require("../middlewares/requireAdmin");

const getApplicationsOverview = require("../controllers/adminControllers/getApplicationsOverview");
const getSellerApplications = require("../controllers/adminControllers/getSellerApplications");
const getSellerApplicationDetails = require("../controllers/adminControllers/getSellerApplicationDetails");
const reviewSellerApplication = require("../controllers/adminControllers/reviewSellerApplication");
const getDeliveryPartnerApplications = require("../controllers/adminControllers/getDeliveryPartnerApplications");
const getSignedDocumentUrl = require("../controllers/adminControllers/getSignedDocumentUrl");
const reviewSellerDocument = require("../controllers/adminControllers/reviewSellerDocument"); // Add this import
const getDeliveryPartnerApplicationDetails = require("../controllers/adminControllers/getDeliveryPartnerApplicationDetails");
const reviewDeliveryPartnerApplication = require("../controllers/adminControllers/reviewDeliveryPartnerApplication");
const reviewDeliveryPartnerDocument = require("../controllers/adminControllers/reviewDeliveryPartnerDocument");

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
router.get(
  "/delivery-partner-applications/:applicationId",
  getDeliveryPartnerApplicationDetails
);
router.post(
  "/delivery-partner-applications/:applicationId/review",
  reviewDeliveryPartnerApplication
);

// Document handling
router.post("/documents/signed-url", getSignedDocumentUrl);
router.post("/seller-documents/:documentId/review", reviewSellerDocument); // Add this route
router.post(
  "/delivery-partner-documents/:documentId/review",
  reviewDeliveryPartnerDocument
);

module.exports = router;
