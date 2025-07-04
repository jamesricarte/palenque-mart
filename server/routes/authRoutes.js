const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");

const { signUpEmail } = require("../controllers/authControllers/signUpEmail");
const { signUpMobile } = require("../controllers/authControllers/signUpMobile");
const { checkEmail } = require("../controllers/authControllers/checkEmail");
const { verifyPhone } = require("../controllers/authControllers/verifyPhone");
const { verifyEmail } = require("../controllers/authControllers/verifyEmail");
const {
  createAccount,
} = require("../controllers/authControllers/createAccount");

const { profile } = require("../controllers/authControllers/profile");

const router = express.Router();

//Sign up with email
router.post("/sign-up-email", signUpEmail);

router.get("/verify-email", verifyEmail);

router.post("/check-email", checkEmail);

//Sign up with mobile
router.post("/sign-up-mobile", signUpMobile);

router.post("/verify-phone", verifyPhone);

//Creation of account
router.post("/create-account", createAccount);

// User info
router.get("/profile", authenticateToken, profile);

module.exports = router;
