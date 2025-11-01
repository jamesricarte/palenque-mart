const db = require("../../config/db");

const getStreamViewerCount = async (req, res) => {
  try {
    const { livestreamId } = req.params;

    const [livestream] = await db.execute(
      `SELECT peak_viewers FROM livestreams WHERE livestream_id = ?`,
      [livestreamId]
    );

    if (livestream.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      });
    }

    const viewerCount = livestream[0].peak_viewers;

    res.status(200).json({
      success: true,
      data: {
        viewerCount,
      },
    });
  } catch (error) {
    console.error("Get stream viewer count error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = getStreamViewerCount;
