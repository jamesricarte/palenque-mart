const express = require("express");
const {
  createAndStartLivestream,
  startBridge,
  startWebRTCIngest,
  endLivestream,
  getLivestreamDetails,
  getActiveLivestreams,
  updateLivestreamProducts,
} = require("../controllers/livestreamControllers/livestreamController");

const router = express.Router();

router.post("/create-and-start", createAndStartLivestream);

router.post("/start-bridge", startBridge);

router.post("/webrtc-ingest", startWebRTCIngest);

// End livestream
router.post("/:livestreamId/end", endLivestream);

// Get livestream details
router.get("/:livestreamId", getLivestreamDetails);

// Get all active livestreams
router.get("/active/all", getActiveLivestreams);

// Update featured products
router.put("/:livestreamId/products", updateLivestreamProducts);

module.exports = router;
