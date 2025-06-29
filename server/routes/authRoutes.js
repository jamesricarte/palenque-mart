const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const db = require("../config/db");
const formValidator = require("../utils/formValidator");

const router = express.Router();

//nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

//JWT
const SECRET = "your_jwt_secret_key";

router.post("/sign-up", (req, res) => {
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
              href="http://192.168.1.11:3000/api/verify-email?token=${token}&email=${signUpData.email}"
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
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // optStore.set(signUpData.email, {
    //   otp,
    //   expiresAt: Date.now() + 5 * 60 * 1000,
    // });

    // const mailOptions = {
    //   from: "jamesmabois@gmail.com",
    //   to: signUpData.email,
    //   subject: "Verification code for your signup",
    //   html: `
    //         <div style="font-family: Arial, sans-serif; font-size: 16px;">
    //         <p>Hello, we are Palenque Mart!</p>
    //         <p>Your verification code: <b>${otp}</b></p>
    //         <p>If you did not request this, you can safely ignore this email.</p>
    //         <p>Thank you!</p>
    //         </div>
    //         `,
    // };
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error(error);
    //     return res.status(500).json({
    //       message:
    //         "Failed to send the email. Please contact the server administrator for assistance.",
    //       error: error,
    //     });
    //   }
    //   console.log(info);
    //   return res.status(200).json({
    //     message:
    //       "A verification code was sent to your email. Please check your inbox to verify.",
    //     info,
    //   });
    // });

    return res
      .status(200)
      .json({ message: "Your mobile number is valid!", success: true });
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
