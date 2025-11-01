const express = require("express");
const createLivestream = require("../controllers/livestreamControllers/createLivestream");
const getStreamStatus = require("../controllers/livestreamControllers/getStreamStatus");
const getStreamViewerCount = require("../controllers/livestreamControllers/getStreamViewerCount");
const endLivestream = require("../controllers/livestreamControllers/endLivestream");
const handleWebhook = require("../controllers/livestreamControllers/handleWebhook");
const getLivestreamDetails = require("../controllers/livestreamControllers/getLivestreamDetails");
const getActiveLivestreams = require("../controllers/livestreamControllers/getActiveLivestreams");
const updateLivestreamProducts = require("../controllers/livestreamControllers/updateLivestreamProducts");
const getSellerLivestreamHistory = require("../controllers/livestreamControllers/getSellerLivestreamHistory");
const deleteLivestream = require("../controllers/livestreamControllers/deleteLivestream");
const addViewer = require("../controllers/livestreamControllers/addViewer");
const removeViewer = require("../controllers/livestreamControllers/removeViewer");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

// Create livestream
router.post("/create", createLivestream);

// Get stream status (for polling)
router.get("/:livestreamId/status", getStreamStatus);

// Get stream viewer count
router.get("/:livestreamId/viewer-count", getStreamViewerCount);

// End livestream
router.post("/:livestreamId/end", endLivestream);

// Delete livestream
router.delete("/:livestreamId", deleteLivestream);

// Webhook handler for Livepeer events
router.post("/webhook", handleWebhook);

// Get livestream details
router.get("/:livestreamId", getLivestreamDetails);

// Get all active livestreams
router.get("/active/all", getActiveLivestreams);

router.get("/seller/:sellerId/history", getSellerLivestreamHistory);

// Update featured products
router.put("/:livestreamId/products", updateLivestreamProducts);

router.post("/:livestreamId/viewer/add", authenticateToken, addViewer);
router.post("/:livestreamId/viewer/remove", authenticateToken, removeViewer);

module.exports = router;
