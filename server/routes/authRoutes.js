const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const axios = require("axios");

const db = require("../config/db");
const formValidator = require("../utils/formValidator");
const getLocalIp = require("../utils/getLocalIp");
const { optStore } = require("../utils/otpStore");

const router = express.Router();

//JWT
const SECRET = "your_jwt_secret_key";

//nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

//Text belt
const TEXTBELT_URL = "http://textbelt.com/text";
const TEXTBELT_API_KEY = "textbelt";

router.post("/sign-up", async (req, res) => {
  const signUpData = req.body;

  const formValidation = formValidator.validate(signUpData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  if ("email" in signUpData) {
    const token = jwt.sign({ email: signUpData.email }, SECRET, {
      expiresIn: "6h",
    });

    const mailOptions = {
      from: "jamesmabois@gmail.com",
      to: signUpData.email,
      subject: "Welcome to Palenque Mart.",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <h1 style="margin: 0; padding: 20px 0;">You're almost done!</h1>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 0;">
            <p style="margin: 0;">
              To finish creating your account, please verify your email address by clicking this link:
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <a
              href="http://${getLocalIp()}:3000/api/verify-email?token=${token}&email=${
        signUpData.email
      }"
              style="
                color: white;
                text-decoration: none;
                background-color: #ffa500;
                border-radius: 4px;
                padding: 10px 20px;
                display: inline-block;
                font-family: Arial, sans-serif;
                font-size: 16px;
              "
            >
              Verify Email Address
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 0;">
            <p style="margin: 0;">If you did not request this, you can safely ignore this email.</p>
            <p style="margin: 0;">Thank you!</p>
          </td>
        </tr>
      </table>
    </div>
          `,
    };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error("ERROR SENDING EMAIL", error);

    //     return res.status(500).json({
    //       message:
    //         "Failed to send the email. Please contact the server administrator for assistance.",
    //       success: false,
    //     });
    //   }

    //   console.log("EMAIL SENT: \n", info.envelope, "\n", info.response);

    //   return res.status(200).json({
    //     message:
    //       "A verification code was sent to your email. Please check your inbox to verify.",
    //     data: { email: signUpData.email },
    //     success: true,
    //   });
    // });

    return res.status(200).json({
      message:
        "A verification code was sent to your email. Please check your inbox to verify.",
      data: { email: signUpData.email },
      success: true,
    });
  } else if ("mobileNumber" in signUpData) {
    const phone = signUpData.mobileNumber;

    if (!phone) {
      return res
        .status(400)
        .json({ message: "Phone number is required.", success: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const [rows] = await db.execute("SELECT phone FROM users WHERE phone = ?", [
      phone,
    ]);

    if (rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Phone number is already used", success: false });
    }

    try {
      optStore.set(phone, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      // const response = await axios.post(TEXTBELT_URL, {
      //   phone,
      //   message: `Your OTP code is: ${otp}`,
      //   key: TEXTBELT_API_KEY,
      // });

      // console.log("Textbelt Response:", response.data);

      const storedOtp = optStore.get(phone);

      console.log(`OTP for ${phone} is: ${storedOtp.otp}`);

      return res.status(200).json({
        message: "OTP sent successfully.",
        success: true,
        data: { mobileNumber: phone },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to send OTP.", success: false });
    }
  }
});

router.post("/check-account", async (req, res) => {
  const emailData = req.body;

  const formValidation = formValidator.validate(emailData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      emailData.email,
    ]);

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Email is not yet registered",
        success: true,
        exists: false,
        email: emailData.email,
      });
    }

    res.status(200).json({
      message: "Email is already registered",
      success: true,
      exists: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/verify-phone", async (req, res) => {
  const userData = req.body;

  const formValidation = formValidator.validate(userData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  const phoneStoredOtp = optStore.get(userData.mobileNumber);

  console.log(optStore);
  console.log(userData.mobileNumber);
  console.log(phoneStoredOtp);
  console.log(userData);

  if (!phoneStoredOtp)
    return res.status(400).json({
      message: "The otp has been already expired, please request a new one.",
      success: false,
    });

  if (userData.otp !== phoneStoredOtp.otp)
    return res.status(400).json({ message: "Invalid otp", success: false });

  const [emailRows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    userData.email,
  ]);

  if (emailRows.length > 0) {
    return res
      .status(400)
      .json({ message: "Email is already registered", success: false });
  }

  const [phoneRows] = await db.execute("SELECT * FROM users WHERE phone = ?", [
    userData.mobileNumber,
  ]);

  if (phoneRows.length > 0) {
    return res
      .status(400)
      .json({ message: "Phone number is already registered", success: false });
  }

  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)",
      [
        userData.firstName,
        userData.lastName,
        userData.email,
        hashedPassword,
        userData.mobileNumber,
      ]
    );

    console.log(result);
    res.status(200).json({ message: "Registered successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
});

router.get("/verify-email", async (req, res) => {
  const token = req.query.token;
  const email = req.query.email;

  const wss = req.app.get("wss");
  if (!wss) console.log("!WSS");

  const verifyToken = jwt.verify(token, "your_jwt_secret_key");

  if (verifyToken) {
    wss.clients.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send(
          JSON.stringify({
            message: "Email Verified",
            email: email,
          })
        );
      }
    });

    return res.status(200).send("Email Verified!");
  } else {
    return res
      .status(400)
      .send(
        "Verification Failed. Your email is either invalid or your token have already expired."
      );
  }
});

router.post("/create-account", async (req, res) => {
  const createAccountData = req.body;

  const formValidation = formValidator.validate(createAccountData);

  if (!formValidation.validation) {
    console.log(formValidation);
    return res.status(400).json({
      message: formValidation.message,
      success: false,
      error: formValidation?.error,
    });
  }

  try {
    const [rows] = await db.execute("SELECT email FROM users WHERE email = ?", [
      createAccountData.email,
    ]);

    if (rows.length > 0) {
      return res.status(400).json({
        message: "Email is already registered",
        exists: true,
        success: true,
      });
    }

    const [result] = await db.execute(
      "INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)",
      [createAccountData.email, null]
    );

    res
      .status(201)
      .json({ message: "Created account successful", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
});

module.exports = router;
