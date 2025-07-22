const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");

const signUpEmail = require("../controllers/authControllers/signUpEmail");
const verifyEmail = require("../controllers/authControllers/verifyEmail");
const sendEmail = require("../controllers/authControllers/sendEmail");
const checkEmail = require("../controllers/authControllers/checkEmail");
const signUpMobile = require("../controllers/authControllers/signUpMobile");
const verifyPhone = require("../controllers/authControllers/verifyPhone");
const sendOtp = require("../controllers/authControllers/sendOtp");
const createAccount = require("../controllers/authControllers/createAccount");
const profile = require("../controllers/authControllers/profile");
const login = require("../controllers/authControllers/login");
const updateProfile = require("../controllers/authControllers/updateProfile");

const router = express.Router();

// Sign up with email
router.post("/sign-up-email", signUpEmail);
router.get("/verify-email", verifyEmail);
router.post("/send-email", sendEmail);
router.post("/check-email", checkEmail);

// Sign up with mobile
router.post("/sign-up-mobile", signUpMobile);
router.post("/verify-phone", verifyPhone);
router.post("/send-otp", sendOtp);

// Creation of account
router.post("/create-account", createAccount);

// User info
router.get("/profile", authenticateToken, profile);

// Login
router.post("/login", login);

// Edit profile
router.post("/update-profile", authenticateToken, updateProfile);

module.exports = router;
