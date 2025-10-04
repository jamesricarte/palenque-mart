const db = require("../../config/db");
const axios = require("axios");
const { spawn } = require("child_process");
const {
  startFFmpegBridge,
  stopFFmpegBridge,
} = require("../../utils/ffmpegBridge");
require("dotenv").config();

const LIVEPEER_API_KEY =
  process.env.LIVEPEER_API_KEY || "YOUR_LIVEPEER_API_KEY_HERE";

const activeStreams = new Map();

const createAndStartLivestream = async (req, res) => {
  try {
    const { sellerId, title, description, thumbnailUrl, productIds } = req.body;

    console.log(req.body);

    if (!sellerId || !title) {
      return res.status(400).json({
        success: false,
        message: "Seller ID and title are required",
      });
    }

    const livepeerResponse = await axios.post(
      "https://livepeer.studio/api/stream",
      { name: title },
      {
        headers: {
          Authorization: `Bearer ${LIVEPEER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!livepeerResponse || !livepeerResponse.data) {
      console.error("Livepeer error:", livepeerResponse);
      return res.status(500).json({
        success: false,
        message: "Failed to create livestream with Livepeer",
        error: livepeerResponse,
      });
    }

    const livepeerData = livepeerResponse.data;

    const streamKey = livepeerData.streamKey;
    const srtUrl = `srt://rtmp.livepeer.com:2935?streamid=${streamKey}`;
    const rtmpUrl = livepeerData.rtmpIngestUrl || null;
    const hlsUrl = livepeerData.playbackId
      ? `https://livepeer.studio/hls/${livepeerData.playbackId}/index.m3u8`
      : null;

    // console.log("livepeerData:", livepeerData);
    // console.log("streamKey:", streamKey);
    // console.log("srtUrl:", srtUrl);

    const [result] = await db.execute(
      `INSERT INTO livestreams 
        (seller_id, title, description, stream_key, thumbnail_url, status, rtmp_url, hls_url, actual_start_time) 
       VALUES (?, ?, ?, ?, ?, 'live', ?, ?, NOW())`,
      [sellerId, title, description, streamKey, thumbnailUrl, rtmpUrl, hlsUrl]
    );

    const livestreamId = result.insertId;

    // Add featured products if provided
    if (productIds && productIds.length > 0) {
      const productValues = productIds.map((productId, index) => [
        livestreamId,
        productId,
        index,
      ]);

      await db.query(
        `INSERT INTO livestream_products (livestream_id, product_id, display_order) VALUES ?`,
        [productValues]
      );
    }

    res.status(201).json({
      success: true,
      message: "Livestream created and started successfully",
      data: {
        livestreamId,
        streamKey,
        srtUrl,
        rtmpUrl,
        hlsUrl,
      },
    });
  } catch (error) {
    console.error("Create and start livestream error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const startBridge = async (req, res) => {
  try {
    const { livestreamId, srtUrl, audioPort, videoPort } = req.body;

    if (!livestreamId || !srtUrl) {
      return res.status(400).json({
        success: false,
        message: "livestreamId and srtUrl are required",
      });
    }

    // Use provided ports or defaults
    const ports = startFFmpegBridge({
      livestreamId,
      srtUrl,
      audioPort: audioPort || 6002,
      videoPort: videoPort || 6004,
    });

    res.status(200).json({
      success: true,
      message: "FFmpeg bridge started successfully",
      data: {
        audioPort: ports.audioPort,
        videoPort: ports.videoPort,
      },
    });
  } catch (error) {
    console.error("Start bridge error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const startWebRTCIngest = async (req, res) => {
  try {
    const { livestreamId, streamKey, sdpOffer } = req.body;

    if (!livestreamId || !streamKey || !sdpOffer) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    const srtUrl = `srt://rtmp.livepeer.com:2935?streamid=${streamKey}`;

    // Note: This is a simplified example. In production, you'd need proper WebRTC server setup
    // using libraries like mediasoup, Janus, or Kurento
    const ffmpegArgs = [
      "-protocol_whitelist",
      "file,pipe,udp,rtp,tcp",
      "-i",
      "pipe:0", // Read from stdin (WebRTC stream will be piped here)
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-b:v",
      "2500k",
      "-maxrate",
      "2500k",
      "-bufsize",
      "5000k",
      "-pix_fmt",
      "yuv420p",
      "-g",
      "50",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "-f",
      "mpegts",
      srtUrl,
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    ffmpeg.stdout.on("data", (data) => {
      console.log(`FFmpeg stdout: ${data}`);
    });

    ffmpeg.stderr.on("data", (data) => {
      console.error(`FFmpeg stderr: ${data}`);
    });

    ffmpeg.on("close", (code, signal) => {
      console.log(
        `FFmpeg process exited with code ${code}, and signal: ${signal}`
      );
      activeStreams.delete(livestreamId);
    });

    activeStreams.set(livestreamId, ffmpeg);

    res.status(200).json({
      success: true,
      message: "WebRTC ingest started",
      data: {
        sdpAnswer: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n", // Placeholder
      },
    });
  } catch (error) {
    console.error("Start WebRTC ingest error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const endLivestream = async (req, res) => {
  try {
    const { livestreamId } = req.params;

    stopFFmpegBridge(Number.parseInt(livestreamId));

    if (activeStreams.has(Number.parseInt(livestreamId))) {
      const ffmpeg = activeStreams.get(Number.parseInt(livestreamId));
      ffmpeg.kill("SIGTERM");
      activeStreams.delete(Number.parseInt(livestreamId));
    }

    // Get livestream details to calculate duration
    const [livestream] = await db.execute(
      `SELECT actual_start_time FROM livestreams WHERE livestream_id = ?`,
      [livestreamId]
    );

    if (livestream.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      });
    }

    const startTime = new Date(livestream[0].actual_start_time);
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    await db.execute(
      `UPDATE livestreams 
       SET status = 'ended', end_time = NOW(), duration_seconds = ? 
       WHERE livestream_id = ?`,
      [durationSeconds, livestreamId]
    );

    // Get final stats
    const [stats] = await db.execute(
      `SELECT 
        peak_viewers,
        total_viewers,
        total_comments,
        total_sales
       FROM livestreams 
       WHERE livestream_id = ?`,
      [livestreamId]
    );

    res.status(200).json({
      success: true,
      message: "Livestream ended successfully",
      data: {
        durationSeconds,
        stats: stats[0],
      },
    });
  } catch (error) {
    console.error("End livestream error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getLivestreamDetails = async (req, res) => {
  try {
    const { livestreamId } = req.params;

    const [livestream] = await db.execute(
      `SELECT 
        l.*,
        u.first_name,
        u.last_name,
        s.store_name,
        s.store_logo_key
       FROM livestreams l
       JOIN users u ON l.seller_id = u.id
       JOIN sellers s ON u.id = s.user_id
       WHERE l.livestream_id = ?`,
      [livestreamId]
    );

    if (livestream.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      });
    }

    // Get featured products
    const [products] = await db.execute(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.image_keys,
        lp.is_pinned,
        lp.display_order
       FROM livestream_products lp
       JOIN products p ON lp.product_id = p.id
       WHERE lp.livestream_id = ?
       ORDER BY lp.display_order`,
      [livestreamId]
    );

    res.status(200).json({
      success: true,
      data: {
        livestream: livestream[0],
        products,
      },
    });
  } catch (error) {
    console.error("Get livestream details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getActiveLivestreams = async (req, res) => {
  try {
    const [livestreams] = await db.execute(
      `SELECT 
        l.livestream_id,
        l.title,
        l.description,
        l.thumbnail_url,
        l.hls_url,
        l.peak_viewers,
        l.actual_start_time,
        u.first_name,
        u.last_name,
        s.store_name,
        s.store_logo_key
       FROM livestreams l
       JOIN users u ON l.seller_id = u.id
       JOIN sellers s ON u.id = s.user_id
       WHERE l.status = 'live'
       ORDER BY l.actual_start_time DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        livestreams,
        count: livestreams.length,
      },
    });
  } catch (error) {
    console.error("Get active livestreams error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateLivestreamProducts = async (req, res) => {
  try {
    const { livestreamId } = req.params;
    const { productIds } = req.body;

    // Remove existing products
    await db.execute(
      `DELETE FROM livestream_products WHERE livestream_id = ?`,
      [livestreamId]
    );

    // Add new products
    if (productIds && productIds.length > 0) {
      const productValues = productIds.map((productId, index) => [
        livestreamId,
        productId,
        index,
      ]);

      await db.query(
        `INSERT INTO livestream_products (livestream_id, product_id, display_order) VALUES ?`,
        [productValues]
      );
    }

    res.status(200).json({
      success: true,
      message: "Products updated successfully",
    });
  } catch (error) {
    console.error("Update products error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createAndStartLivestream,
  startBridge,
  startWebRTCIngest,
  endLivestream,
  getLivestreamDetails,
  getActiveLivestreams,
  updateLivestreamProducts,
};
