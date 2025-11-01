const db = require("../../config/db");
const axios = require("axios");
require("dotenv").config();

const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;

const deleteLivestream = async (req, res) => {
  try {
    const { livestreamId } = req.params;
    const { sellerId } = req.query;

    // Verify livestream exists and belongs to the seller
    const [livestream] = await db.execute(
      `SELECT livestream_id, seller_id, stream_id, status FROM livestreams WHERE livestream_id = ?`,
      [livestreamId]
    );

    if (livestream.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      });
    }

    // Verify ownership
    if (livestream[0].seller_id !== parseInt(sellerId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own livestreams",
      });
    }

    // Only allow deletion of ended or cancelled livestreams
    if (!["ended", "cancelled"].includes(livestream[0].status)) {
      return res.status(400).json({
        success: false,
        message: "Can only delete ended or cancelled livestreams",
      });
    }

    // Delete from Livepeer
    const streamId = livestream[0].stream_id;
    try {
      await axios.delete(`https://livepeer.studio/api/stream/${streamId}`, {
        headers: { Authorization: `Bearer ${LIVEPEER_API_KEY}` },
      });
      console.log(`Stream ${streamId} deleted from Livepeer`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(`Stream ${streamId} was already deleted from Livepeer`);
      } else {
        console.error("Error deleting stream from Livepeer:", error.message);
      }
    }

    // Delete from database (cascade will handle related records)
    await db.execute(`DELETE FROM livestreams WHERE livestream_id = ?`, [
      livestreamId,
    ]);

    res.status(200).json({
      success: true,
      message: "Livestream deleted successfully",
    });
  } catch (error) {
    console.error("Delete livestream error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = deleteLivestream;
