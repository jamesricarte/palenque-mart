const db = require("../../config/db");
const crypto = require("crypto");
require("dotenv").config();

const WEBHOOK_SECRET = process.env.LIVEPEER_WEBHOOK_SECRET;

const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const signatureHeader = req.headers["livepeer-signature"];
    if (!signatureHeader) {
      console.error("❌ Missing webhook signature");
      return res.status(401).json({
        success: false,
        message: "Missing webhook signature",
      });
    }

    const body = JSON.stringify(req.body);

    const [timestampPart, signaturePart] = signatureHeader.split(",");
    const timestamp = timestampPart.split("=")[1];
    const signature = signaturePart.split("=")[1];

    const computedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (computedSignature !== signature) {
      console.error("❌ Invalid webhook signature");
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    console.log("✅ Verified webhook from Livepeer");

    const { event, stream } = req.body;
    const eventEmoji = event === "stream.started" ? "▶️" : "🛑";
    console.log("Webhook event received:", event, eventEmoji);

    if (event === "stream.started") {
      // Stream has started in Livepeer - update database
      const streamId = stream.id;

      const [livestream] = await db.execute(
        `SELECT livestream_id FROM livestreams WHERE stream_id = ?`,
        [streamId]
      );

      if (livestream.length > 0) {
        const livestreamId = livestream[0].livestream_id;

        // Update status to 'live' and set actual_start_time
        await db.execute(
          `UPDATE livestreams 
           SET status = 'live', actual_start_time = NOW() 
           WHERE livestream_id = ?`,
          [livestreamId]
        );

        console.log(`Stream ${livestreamId} marked as live in database`);
      }
    } else if (event === "stream.idle") {
      // Stream has ended in Livepeer
      const streamId = stream.id;

      const [livestream] = await db.execute(
        `SELECT livestream_id, actual_start_time FROM livestreams WHERE stream_id = ?`,
        [streamId]
      );

      // if (livestream.length > 0) {
      //   const livestreamId = livestream[0].livestream_id;
      //   const startTime = new Date(livestream[0].actual_start_time);
      //   const endTime = new Date();
      //   const durationSeconds = Math.floor((endTime - startTime) / 1000);

      //   // Update status to 'ended'
      //   await db.execute(
      //     `UPDATE livestreams
      //      SET status = 'ended', end_time = NOW(), duration_seconds = ?
      //      WHERE livestream_id = ?`,
      //     [durationSeconds, livestreamId]
      //   );

      //   console.log(`Stream ${livestreamId} marked as ended in database`);
      // }
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = handleWebhook;
