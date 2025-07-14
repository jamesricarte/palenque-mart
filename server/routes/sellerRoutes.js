const express = require("express")
const authenticateToken = require("../middlewares/authenticateToken")

const submitSellerApplication = require("../controllers/sellerControllers/submitSellerApplication")

const router = express.Router()

// Seller application submission
router.post("/submit-application", authenticateToken, submitSellerApplication)

module.exports = router
