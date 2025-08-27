const express = require("express")
const router = express.Router()
const authenticateToken = require("../middlewares/authenticateToken")
const { upload, handleUploadError } = require("../middlewares/uploadMiddleware")

// Import controllers
const submitReview = require("../controllers/reviewControllers/submitReview")
const getProductReviews = require("../controllers/reviewControllers/getProductReviews")
const markReviewHelpful = require("../controllers/reviewControllers/markReviewHelpful")

// Routes
router.post("/submit", authenticateToken, upload, handleUploadError, submitReview)
router.get("/product/:productId", getProductReviews)
router.post("/helpful", authenticateToken, markReviewHelpful)

module.exports = router
