const db = require("../../config/db");
const axios = require("axios");
require("dotenv").config();

const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;

const getStreamStatus = async (req, res) => {
  try {
    const { livestreamId } = req.params;

    const [livestream] = await db.execute(
      `SELECT stream_id, status, actual_start_time FROM livestreams WHERE livestream_id = ?`,
      [livestreamId]
    );

    if (livestream.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      });
    }

    const stream = livestream[0];

    let isReady = stream.status === "live" && stream.actual_start_time !== null;

    // Fallback, check again from livepeer for stream's status
    if (!isReady) {
      const streamId = stream.stream_id;

      const livepeerResponse = await axios.get(
        `https://livepeer.studio/api/stream/${streamId}`,
        {
          headers: {
            Authorization: `Bearer ${LIVEPEER_API_KEY}`,
          },
        }
      );

      const streamData = livepeerResponse.data;

      if (streamData.isActive) {
        await db.execute(
          `UPDATE livestreams 
           SET status = 'live', actual_start_time = NOW() 
           WHERE livestream_id = ?`,
          [livestreamId]
        );

        const [livestream] = await db.execute(
          `SELECT status, actual_start_time FROM livestreams WHERE livestream_id = ?`,
          [livestreamId]
        );

        if (livestream.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Livestream not found",
          });
        }

        stream.status = livestream[0].status;
        stream.actual_start_time = livestream[0].actual_start_time;
        isReady = true;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        status: stream.status,
        isReady: isReady,
        startTime: stream.actual_start_time,
      },
    });
  } catch (error) {
    console.error("Get stream status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = getStreamStatus;
