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
    from: `"Palenque Mart" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: "Welcome to Palenque Mart.",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #F16B44; margin: 0; font-size: 28px;">Verify Your Email</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; margin-bottom: 15px;">You're Almost Done!</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                To finish creating your account, please verify your email address by clicking the button below.
              </p>
            </div>

            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #F16B44; margin-bottom: 25px;">
              <h3 style="color: #F16B44; margin: 0 0 10px 0;">Verification Required</h3>
              <p style="margin: 5px 0; color: #333; font-size: 14px;">Click the button below to verify your email address and activate your account.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://${getLocalIp()}:${
      process.env.PORT
    }/api/open-app-verify?token=${token}&email=${email}" 
                style="background-color: #F16B44; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Verify Email Address
              </a>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; margin-bottom: 15px;">Why Verify?</h3>
              <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li>Secure your account with a verified email</li>
                <li>Receive important account notifications</li>
                <li>Unlock full access to Palenque Mart features</li>
              </ul>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                If you did not create this account, you can safely ignore this email.<br>
                Thank you for choosing Palenque Mart!
              </p>
            </div>
          </div>
        </div>`,
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; margin-bottom: 15px;">Hello ${user.first_name},</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                We're excited to inform you that your seller application has been <strong style="color: #f97316;">approved</strong>! 
                Welcome to the Palenque Mart seller community.
              </p>
            </div>

            <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 25px;">
              <h3 style="color: #f97316; margin: 0 0 10px 0;">Your Seller Details:</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Seller ID:</strong> ${user.seller_id}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Store Name:</strong> ${user.store_name}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Account Type:</strong> ${user.account_type}</p>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li>Access your seller dashboard to manage your store</li>
                <li>Add your first products to start selling</li>
                <li>Set up your store profile and preferences</li>
                <li>Start receiving orders from customers</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://palenquemart.com/login" 
                 style="background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Access Seller Dashboard
              </a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                If you have any questions, please contact our support team.<br>
                Thank you for choosing Palenque Mart!
              </p>
            </div>
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🚚 Congratulations!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; margin-bottom: 15px;">Hello ${user.first_name},</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                We're excited to inform you that your delivery partner application has been <strong style="color: #16a34a;">approved</strong>! 
                Welcome to the Palenque Mart delivery team.
              </p>
            </div>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
              <h3 style="color: #16a34a; margin: 0 0 10px 0;">Your Delivery Partner Details:</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Partner ID:</strong> ${user.partner_id}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Vehicle Type:</strong> ${user.vehicle_type}</p>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li>Access your delivery partner dashboard</li>
                <li>Set your availability and go online</li>
                <li>Start accepting delivery requests</li>
                <li>Track your earnings and performance</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://palenquemart.com/login" 
                 style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Access Delivery Dashboard
              </a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                If you have any questions, please contact our support team.<br>
                Thank you for joining Palenque Mart!
              </p>
            </div>
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
