const db = require("../../config/db");
const axios = require("axios");
require("dotenv").config();

const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;

const createLivestream = async (req, res) => {
  try {
    const { sellerId, title, description, thumbnailUrl, productIds } = req.body;

    if (!sellerId || !title) {
      return res.status(400).json({
        success: false,
        message: "Seller ID and title are required",
      });
    }

    // Create stream in Livepeer
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
      });
    }

    const livepeerData = livepeerResponse.data;

    const streamId = livepeerData.id;
    const streamKey = livepeerData.streamKey;
    const rtmpUrl = streamKey
      ? `rtmp://rtmp.livepeer.com/live/${streamKey}`
      : null;
    const hlsUrl = livepeerData.playbackId
      ? `https://livepeercdn.studio/hls/${livepeerData.playbackId}/index.m3u8`
      : null;

    // Save to database with 'setup' status (not 'live' yet)
    const [result] = await db.execute(
      `INSERT INTO livestreams 
        (seller_id, title, description, stream_id, stream_key, thumbnail_url, status, rtmp_url, hls_url) 
       VALUES (?, ?, ?, ?, ?, ?, 'setup', ?, ?)`,
      [
        sellerId,
        title,
        description,
        streamId,
        streamKey,
        thumbnailUrl,
        rtmpUrl,
        hlsUrl,
      ]
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
      message: "Livestream created successfully",
      data: {
        livestreamId,
        streamKey,
        rtmpUrl,
        hlsUrl,
      },
    });
  } catch (error) {
    console.error("Create livestream error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = createLivestream;
