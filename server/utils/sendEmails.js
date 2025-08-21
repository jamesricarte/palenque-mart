const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getLocalIp = require("./getLocalIp");
const { createNotification } = require("./createNotification");

//nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

/**
 * Sends an email using the pre-configured transporter.
 * @param {object} mailOptions - Nodemailer mail options object.
 */
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error(`Error sending email to ${mailOptions.to}:`, error);
  }
};

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

  sendEmail(mailOptions);
}

/**
 * Sends both email and push notifications for seller application approval.
 * @param {object} user - The user object, containing id, email, first_name, and store_name.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 */
const sendSellerApprovalNotification = async (user) => {
  // 1. Send Congratulatory Email
  const emailOptions = {
    from: `"Palenque Mart" <${process.env.ADMIN_EMAIL}>`,
    to: user.email,
    subject: "Congratulations! Your Seller Application is Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #16a34a; text-align: center;">Welcome to the Palenque Mart Family!</h1>
          <p>Hi ${user.first_name},</p>
          <p>We are thrilled to inform you that your seller application for <strong>${
            user.store_name || "your store"
          }</strong> has been approved!</p>
          <p>You can now log in to your account, access your new Seller Dashboard, and start listing your products. We're excited to see what you'll bring to our marketplace.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://palenquemart.com/login" style="display: inline-block; padding: 12px 24px; background-color: #F16B44; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Your Seller Dashboard
            </a>
          </div>
          <p>Welcome aboard!</p>
          <p>The Palenque Mart Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">
            If you did not apply to be a seller, please contact our support team immediately.
          </p>
        </div>
      </div>
    `,
  };

  sendEmail(emailOptions);

  // 2. Send Push Notification via WebSocket
  const customPayload = {
    type: "SELLER_APP_APPROVED",
  };

  const notificationData = {
    userId: user.id,
    title: "Application Approved!",
    message: `Congratulations, ${user.first_name}! You can now start selling on Palenque Mart.`,
    type: "system",
    referenceId: null,
    referenceType: "seller",
    action: "open_application_status",
    deepLink: null,
    extraData: null,
  };

  createNotification(notificationData, customPayload);
};

/**
 * Sends both email and push notifications for delivery partner application approval.
 * @param {object} user - The user object, containing id, email, first_name, partner_id, and vehicle_type.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 */
const sendDeliveryPartnerApprovalNotification = async (user, userSocket) => {
  // 1. Send Congratulatory Email
  const emailOptions = {
    from: `"Palenque Mart" <${process.env.ADMIN_EMAIL}>`,
    to: user.email,
    subject: "Congratulations! Your Delivery Partner Application is Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #16a34a; text-align: center;">Welcome to the Palenque Mart Delivery Team!</h1>
          <p>Hi ${user.first_name},</p>
          <p>We are excited to inform you that your delivery partner application has been approved!</p>
          <p>Your Partner ID is: <strong>${user.partner_id}</strong></p>
          <p>Vehicle Type: <strong>${user.vehicle_type}</strong></p>
          <p>You can now log in to your account and access your new Delivery Partner Dashboard to start accepting delivery orders. We're looking forward to having you as part of our delivery network.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://palenquemart.com/login" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Your Delivery Dashboard
            </a>
          </div>
          <p>Welcome to the team!</p>
          <p>The Palenque Mart Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">
            If you did not apply to be a delivery partner, please contact our support team immediately.
          </p>
        </div>
      </div>
    `,
  };
  sendEmail(emailOptions);

  // 2. Send Push Notification via WebSocket
  const customPayload = {
    type: "DELIVERY_PARTNER_APP_APPROVED",
  };

  const notificationData = {
    userId: user.id,
    title: "Application Approved!",
    message: `Congratulations, ${user.first_name}! You can now start delivering for Palenque Mart.`,
    type: "system",
    referenceId: null,
    referenceType: "delivery_partner",
    action: "open_application_status",
    deepLink: null,
    extraData: null,
  };

  createNotification(notificationData, customPayload);
};

module.exports = {
  sendVerificationEmail,
  sendSellerApprovalNotification,
  sendDeliveryPartnerApprovalNotification,
};
