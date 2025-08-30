const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

// Import controllers
const createBargainOffer = require("../controllers/bargainControllers/createBargainOffer");
const respondToBargainOffer = require("../controllers/bargainControllers/respondToBargainOffer");
const getSellerActiveProducts = require("../controllers/bargainControllers/getSellerActiveProducts");
const checkOngoingBargain = require("../controllers/bargainControllers/checkOngoingBargain");

// Routes
router.post("/create-offer", authenticateToken, createBargainOffer);
router.put("/respond/:offerId", authenticateToken, respondToBargainOffer);
router.get(
  "/seller/:sellerId/products/:conversationId",
  authenticateToken,
  getSellerActiveProducts
);
router.get(
  "/check/:conversationId/:productId",
  authenticateToken,
  checkOngoingBargain
);

module.exports = router;
