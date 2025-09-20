const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

// User chat controllers
const getUserConversationId = require("../controllers/chatControllers/User/getUserConversationId");
const getUserConversations = require("../controllers/chatControllers/User/getUserConversations");
const getUserConversationMessages = require("../controllers/chatControllers/User/getUserConversationMessages");
const sendMessage = require("../controllers/chatControllers/User/sendMessage");
const markMessagesAsRead = require("../controllers/chatControllers/User/markMessagesAsRead");
const getUserDeliveryPartnerConversationMessages = require("../controllers/chatControllers/User/getUserDeliveryPartnerConversationMessages");
const sendUserDeliveryPartnerMessage = require("../controllers/chatControllers/User/sendDeliveryPartnerMessage");
const markUserDeliveryPartnerMessagesAsRead = require("../controllers/chatControllers/User/markDeliveryPartnerMessagesAsRead");

// Seller chat controllers
const getSellerConversations = require("../controllers/chatControllers/Seller/getSellerConversations");
const getSellerConversationMessages = require("../controllers/chatControllers/Seller/getSellerConversationMessages");
const sendSellerMessage = require("../controllers/chatControllers/Seller/sendSellerMessage");
const markSellerDeliveryPartnerMessagesAsRead = require("../controllers/chatControllers/Seller/markSellerDeliveryPartnerMessagesAsRead");
const markSellerMessagesAsRead = require("../controllers/chatControllers/Seller/markSellerMessagesAsRead");
const getSellerDeliveryPartnerConversationId = require("../controllers/chatControllers/Seller/getSellerDeliveryPartnerConversationId");
const getSellerDeliveryPartnerMessages = require("../controllers/chatControllers/Seller/getSellerDeliveryPartnerMessages");
const sendSellerDeliveryPartnerMessage = require("../controllers/chatControllers/Seller/sendSellerDeliveryPartnerMessage");

// Delivery Parter chat controllers
const getDeliveryPartnerConversationId = require("../controllers/chatControllers/DeliveryPartner/getDeliveryPartnerConversationId");
const getDeliveryPartnerConversations = require("../controllers/chatControllers/DeliveryPartner/getDeliveryPartnerConversations");
const getDeliveryPartnerConversationMessages = require("../controllers/chatControllers/DeliveryPartner/getDeliveryPartnerConversationMessages");
const sendDeliveryPartnerMessage = require("../controllers/chatControllers/DeliveryPartner/sendDeliveryPartnerMessage");
const markDeliveryPartnerMessagesAsRead = require("../controllers/chatControllers/DeliveryPartner/markDeliveryPartnerMessagesAsRead");

// Miscellaneous chat controllers
const getunreadMessagesCount = require("../controllers/chatControllers/getunreadMessagesCount");

// User chat routes
router.get(
  "/:sellerId/conversation-id",
  authenticateToken,
  getUserConversationId
);
router.get(
  "/delivery-partner/:deliveryPartnerId/order/:orderId/conversation-id",
  authenticateToken,
  getUserConversationId
);
router.get("/conversations", authenticateToken, getUserConversations);
router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  getUserConversationMessages
);
router.get(
  "/user/delivery-partner/conversations/:conversationId/messages",
  authenticateToken,
  getUserDeliveryPartnerConversationMessages
);
router.post("/send-message", authenticateToken, sendMessage);
router.post(
  "/user/delivery-partner/send-message",
  authenticateToken,
  sendUserDeliveryPartnerMessage
);
router.put(
  "/conversations/:conversationId/mark-read",
  authenticateToken,
  markMessagesAsRead
);
router.put(
  "/user/delivery-partner/conversations/:conversationId/mark-read",
  authenticateToken,
  markUserDeliveryPartnerMessagesAsRead
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
  "/seller/delivery-partner/conversations/:conversationId/mark-read",
  authenticateToken,
  markSellerDeliveryPartnerMessagesAsRead
);
router.put(
  "/seller/conversations/:conversationId/mark-read",
  authenticateToken,
  markSellerMessagesAsRead
);
router.get(
  "/seller/conversation-id/:deliveryPartnerId",
  authenticateToken,
  getSellerDeliveryPartnerConversationId
);
router.get(
  "/seller/conversations/:conversationId/messages",
  authenticateToken,
  getSellerDeliveryPartnerMessages
);
router.post(
  "/seller/delivery-partner/send-message",
  authenticateToken,
  sendSellerDeliveryPartnerMessage
);

// Delivery partner chat routes
router.get(
  "/delivery-partner/:sellerId/conversation-id",
  authenticateToken,
  getDeliveryPartnerConversationId
);
router.get(
  "/delivery-partner/conversations",
  authenticateToken,
  getDeliveryPartnerConversations
);
router.get(
  "/delivery-partner/conversations/:conversationId/messages",
  authenticateToken,
  getDeliveryPartnerConversationMessages
);
router.post(
  "/delivery-partner/send-message",
  authenticateToken,
  sendDeliveryPartnerMessage
);
router.put(
  "/delivery-partner/conversations/:conversationId/mark-read",
  authenticateToken,
  markDeliveryPartnerMessagesAsRead
);

// Miscellaneous chat routes
// Single unread count endpoint
router.get("/unread-count", getunreadMessagesCount.getUnreadMessageCount);

// Multiple unread counts endpoint (for delivery partners)
router.get(
  "/unread-counts/multiple",
  getunreadMessagesCount.getMultipleUnreadCounts
);

module.exports = router;
