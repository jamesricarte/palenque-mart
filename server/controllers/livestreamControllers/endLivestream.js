const db = require("../../config/db");
const axios = require("axios");
require("dotenv").config();

const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;

const endLivestream = async (req, res) => {
  try {
    const { livestreamId } = req.params;
    const { status } = req.body;

    // Get livestream details to calculate duration
    const [livestream] = await db.execute(
      `SELECT stream_id, actual_start_time FROM livestreams WHERE livestream_id = ?`,
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

    if (status === "ended") {
      // Mark as ended (will be updated to 'ended' when stream.idle webhook is received)
      await db.execute(
        `UPDATE livestreams 
       SET status = 'ended', end_time = NOW(), duration_seconds = ? 
       WHERE livestream_id = ?`,
        [durationSeconds, livestreamId]
      );
    } else {
      await db.execute(
        "UPDATE livestreams SET status = ? WHERE livestream_id = ?",
        [status, livestreamId]
      );
    }

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

    // Delete stream from livepeer
    const streamId = livestream[0].stream_id;

    try {
      await axios.delete(`https://livepeer.studio/api/stream/${streamId}`, {
        headers: { Authorization: `Bearer ${LIVEPEER_API_KEY}` },
      });

      console.log(`Stream ${livestreamId} deleted successfully from Livepeer`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(`Stream ${streamId} was already deleted from Livepeer.`);
      } else {
        console.error("Error deleting stream:", error.message);
      }
    }

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

module.exports = endLivestream;
