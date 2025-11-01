const db = require("../../config/db");

const removeViewer = async (req, res) => {
  try {
    const { livestreamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if livestream exists and is live
    const [livestream] = await db.execute(
      "SELECT livestream_id, seller_id, status, peak_viewers FROM livestreams WHERE livestream_id = ?",
      [livestreamId]
    );

    if (!livestream || livestream.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      });
    }

    if (livestream[0].status !== "live") {
      return res.status(400).json({
        success: false,
        message: "Livestream is not currently live",
      });
    }

    // Find the viewer record
    // const [viewer] = await db.execute(
    //   "SELECT viewer_id, joined_at FROM livestream_viewers WHERE livestream_id = ? AND user_id = ? AND left_at IS NULL",
    //   [livestreamId, userId],
    // )

    // if (!viewer || viewer.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Viewer record not found",
    //   })
    // }

    // Calculate watch duration
    // const joinedAt = new Date(viewer[0].joined_at);
    // const leftAt = new Date();
    // const watchDurationSeconds = Math.floor((leftAt - joinedAt) / 1000);

    // Update viewer record with left_at and watch_duration
    // await db.execute(
    //   "UPDATE livestream_viewers SET left_at = NOW(), watch_duration_seconds = ? WHERE viewer_id = ?",
    //   [watchDurationSeconds, viewer[0].viewer_id]
    // );

    // Update peak_viewers count
    if (livestream[0].peak_viewers > 0) {
      await db.execute(
        "UPDATE livestreams SET peak_viewers = peak_viewers - 1 WHERE livestream_id = ?",
        [livestreamId]
      );

      console.log(
        `Subtracted peak_viewers count in livestream id ${livestreamId}`
      );
    } else {
      console.log(
        `The peak viewers of livestream with id of ${livestreamId} is already 0`
      );
    }

    //Send a websocket update viewer count to specific seller
    const sellers = req.app.get("sellers");

    const updateViewCount = {
      type: "UPDATE_VIEWER_COUNT",
      message: "Update viewer count to stream",
    };

    const sellerId = livestream[0].seller_id;
    const seller = sellers.get(sellerId);

    if (seller && seller.socket && seller.socket.readyState === 1) {
      seller.socket.send(JSON.stringify(updateViewCount));
      console.log(`Sent remove viewer to seller id: ${sellerId}`);
    }

    res.status(200).json({
      success: true,
      message: "Viewer removed successfully",
      // watchDuration: watchDurationSeconds,
    });
  } catch (error) {
    console.error("Remove viewer error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = removeViewer;
