const db = require("../../config/db");

const addViewer = async (req, res) => {
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
      "SELECT livestream_id, seller_id, status FROM livestreams WHERE livestream_id = ?",
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

    // Check if user is already viewing
    // const [existingViewer] = await db.execute(
    //   "SELECT viewer_id FROM livestream_viewers WHERE livestream_id = ? AND user_id = ? AND left_at IS NULL",
    //   [livestreamId, userId],
    // )

    // if (existingViewer && existingViewer.length > 0) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "User already viewing this livestream",
    //   })
    // }

    // Add viewer
    // await db.execute("INSERT INTO livestream_viewers (livestream_id, user_id, joined_at) VALUES (?, ?, NOW())", [
    //   livestreamId,
    //   userId,
    // ])

    // Update peak_viewers count
    await db.execute(
      "UPDATE livestreams SET peak_viewers = peak_viewers + 1 WHERE livestream_id = ?",
      [livestreamId]
    );

    console.log(`Added peak_viewers count in livestream id ${livestreamId}`);

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
      console.log(`Sent add viewer to seller id: ${sellerId}`);
    }

    res.status(200).json({
      success: true,
      message: "Viewer added successfully",
    });
  } catch (error) {
    console.error("Add viewer error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = addViewer;
