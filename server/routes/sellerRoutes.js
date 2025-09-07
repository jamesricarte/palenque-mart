const express = require("express")
const router = express.Router()
const authenticateToken = require("../middlewares/authenticateToken")
const { upload, handleUploadError } = require("../middlewares/uploadMiddleware")

// Import controllers
const submitSellerApplication = require("../controllers/sellerControllers/submitSellerApplication")

const getApplicationStatus = require("../controllers/sellerControllers/getApplicationStatus")
const resubmitDocuments = require("../controllers/sellerControllers/resubmitDocuments")
const addProduct = require("../controllers/sellerControllers/addProduct")
const getStoreProfile = require("../controllers/sellerControllers/getStoreProfile")
const updateStoreProfile = require("../controllers/sellerControllers/updateStoreProfile")
const getProducts = require("../controllers/sellerControllers/getProducts")

const getSellerOrders = require("../controllers/sellerControllers/getSellerOrders")
const updateOrderStatus = require("../controllers/sellerControllers/updateOrderStatus")
const getSellerOrderDetails = require("../controllers/sellerControllers/getSellerOrderDetails")

const createDeliveryAssignment = require("../controllers/sellerControllers/createDeliveryAssignment")

const getSellerStats = require("../controllers/sellerControllers/getSellerStats")
const getSellerTransactions = require("../controllers/sellerControllers/getSellerTransactions")
const getSellerAnalytics = require("../controllers/sellerControllers/getSellerAnalytics")

const toggleProductPreOrder = require("../controllers/sellerControllers/toggleProductPreOrder")

// Routes
router.post("/submit-application", authenticateToken, upload, handleUploadError, submitSellerApplication)

// Route to get the status of a seller's application
router.get("/application-status", authenticateToken, getApplicationStatus)

// Route for resubmitting documents
router.post("/resubmit-documents", authenticateToken, upload, resubmitDocuments)

// Route for adding a new product
router.post("/add-product", authenticateToken, upload, addProduct)

// Route to get store profile
router.get("/store-profile", authenticateToken, getStoreProfile)

// Route to update store profile
router.put("/store-profile", authenticateToken, updateStoreProfile)

// Route to get seller's products
router.get("/products", authenticateToken, getProducts)

router.put("/products/:productId/pre-order", authenticateToken, toggleProductPreOrder)

// Route to get seller's orders
router.get("/orders", authenticateToken, getSellerOrders)

// Route to get order details
router.get("/orders/:orderId", authenticateToken, getSellerOrderDetails)

// Route to update order status
router.put("/orders/:orderId/status", authenticateToken, updateOrderStatus)

router.post("/create-delivery-assignment", authenticateToken, createDeliveryAssignment)

// Route to get seller statistics
router.get("/stats", authenticateToken, getSellerStats)

// Route to get seller transaction history
router.get("/transactions", authenticateToken, getSellerTransactions)

// Route to get seller analytics
router.get("/analytics", authenticateToken, getSellerAnalytics)

module.exports = router
