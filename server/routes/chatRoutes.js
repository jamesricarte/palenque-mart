const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

// Import chat controllers
const getUserConversationId = require("../controllers/chatControllers/getUserConversationId");
const getUserConversations = require("../controllers/chatControllers/getUserConversations");
const getConversationMessages = require("../controllers/chatControllers/getConversationMessages");
const sendMessage = require("../controllers/chatControllers/sendMessage");
const markMessagesAsRead = require("../controllers/chatControllers/markMessagesAsRead");

const getSellerConversations = require("../controllers/chatControllers/getSellerConversations");
const getSellerConversationMessages = require("../controllers/chatControllers/getSellerConversationMessages");
const sendSellerMessage = require("../controllers/chatControllers/sendSellerMessage");
const markSellerMessagesAsRead = require("../controllers/chatControllers/markSellerMessagesAsRead");

// Consumer/User chat routes
router.get(
  "/:sellerId/conversation-id",
  authenticateToken,
  getUserConversationId
);
router.get("/conversations", authenticateToken, getUserConversations);
router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  getConversationMessages
);
router.post("/send-message", authenticateToken, sendMessage);
router.put(
  "/conversations/:conversationId/mark-read",
  authenticateToken,
  markMessagesAsRead
);

// Seller chat routes
router.get("/seller/conversations", authenticateToken, getSellerConversations);
router.get(
  "/seller/conversations/:conversationId/messages",
  authenticateToken,
  getSellerConversationMessages
);
router.post("/seller/send-message", authenticateToken, sendSellerMessage);
router.put(
  "/seller/conversations/:conversationId/mark-read",
  authenticateToken,
  markSellerMessagesAsRead
);

module.exports = router;
