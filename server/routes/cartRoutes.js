const express = require("express");
const router = express.Router();
const addToCart = require("../controllers/cartControllers/addToCart");
const getCartItems = require("../controllers/cartControllers/getCartItems");
const updateCartItem = require("../controllers/cartControllers/updateCartItem");
const removeCartItem = require("../controllers/cartControllers/removeCartItem");
const authenticateToken = require("../middlewares/authenticateToken");

const getCartCount = require("../controllers/cartControllers/getCartCount");

router.post("/add", authenticateToken, addToCart);
router.get("/", authenticateToken, getCartItems);
router.delete("/remove/:cartId", authenticateToken, removeCartItem);
router.put("/update/:cartId", authenticateToken, updateCartItem);
router.delete("/clear", authenticateToken, () => {});

// Add this route with the other cart routes
router.get("/count", authenticateToken, getCartCount);

module.exports = router;
