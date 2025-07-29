const express = require("express")
const router = express.Router()
const authenticateToken = require("../middlewares/authenticateToken")
const { upload, handleUploadError } = require("../middlewares/uploadMiddleware")

// Import controllers
const submitDeliveryPartnerApplication = require("../controllers/deliveryPartnerControllers/submitDeliveryPartnerApplication")
const getApplicationStatus = require("../controllers/deliveryPartnerControllers/getApplicationStatus")
const resubmitDocuments = require("../controllers/deliveryPartnerControllers/resubmitDocuments")

// Routes
router.post("/submit-application", authenticateToken, upload, handleUploadError, submitDeliveryPartnerApplication)

// Route to get the status of a delivery partner's application
router.get("/application-status", authenticateToken, getApplicationStatus)

// Route for resubmitting documents
router.post("/resubmit-documents", authenticateToken, upload, resubmitDocuments)

module.exports = router
