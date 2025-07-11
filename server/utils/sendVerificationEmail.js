const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getLocalIp = require("../utils/getLocalIp");

//nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

/**
 * Send email verification link
 * @param {string} email - the recipient's email
 * @returns {Promise} resolves when email sent successfully
 */

async function sendVerificationEmail(email, verificationType = "new") {
  //jwt
  const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const mailOptions = {
    from: "jamesmabois@gmail.com",
    to: email,
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
              href="http://${getLocalIp()}:3000/api/verify-email?token=${token}&email=${email}"
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

  return transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;
