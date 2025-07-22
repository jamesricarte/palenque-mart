const express = require("express")
const router = express.Router()

const authenticateToken = require("../middlewares/authenticateToken")
const getUserAddresses = require("../controllers/addressControllers/getUserAddresses")
const addUserAddress = require("../controllers/addressControllers/addUserAddress")
const updateUserAddress = require("../controllers/addressControllers/updateUserAddress")
const deleteUserAddress = require("../controllers/addressControllers/deleteUserAddress")

// All routes require authentication
router.use(authenticateToken)

// Get user addresses
router.get("/", getUserAddresses)

// Add new address
router.post("/", addUserAddress)

// Update address
router.put("/:addressId", updateUserAddress)

// Delete address
router.delete("/:addressId", deleteUserAddress)

module.exports = router
