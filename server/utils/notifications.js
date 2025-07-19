const nodemailer = require("nodemailer")
const WebSocket = require("ws")
require("dotenv").config()

// Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
})

/**
 * Sends an email using the pre-configured transporter.
 * @param {object} mailOptions - Nodemailer mail options object.
 */
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${mailOptions.to}`)
  } catch (error) {
    console.error(`Error sending email to ${mailOptions.to}:`, error)
  }
}

/**
 * Sends a push notification to a specific user via WebSocket.
 * In a production app, this would integrate with a real Push Notification Service (like FCM or APNs).
 * For now, it notifies active client sessions.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 * @param {number} userId - The ID of the target user.
 * @param {object} payload - The notification payload.
 */
const sendPushNotification = (wss, userId, payload) => {
  if (!wss || !wss.clients) {
    console.error("WebSocket server not available for push notification.")
    return
  }

  const message = JSON.stringify({ ...payload, targetUserId: userId })

  // Broadcast the message; the client will filter based on targetUserId.
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

/**
 * Sends both email and push notifications for seller application approval.
 * @param {object} user - The user object, containing id, email, first_name, and store_name.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 */
const sendSellerApprovalNotification = async (user, wss) => {
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
          <p>We are thrilled to inform you that your seller application for <strong>${user.store_name || "your store"}</strong> has been approved!</p>
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
  }
  sendEmail(emailOptions)

  // 2. Send Push Notification via WebSocket
  const pushPayload = {
    type: "SELLER_APP_APPROVED",
    title: "Application Approved!",
    body: `Congratulations, ${user.first_name}! You can now start selling on Palenque Mart.`,
  }
  sendPushNotification(wss, user.id, pushPayload)
}

module.exports = { sendSellerApprovalNotification }
