const db = require("../../config/db");

const getActiveLivestreams = async (req, res) => {
  try {
    const [livestreams] = await db.execute(
      `SELECT 
        l.livestream_id,
        l.title,
        l.description,
        l.thumbnail_url,
        l.status,
        l.hls_url,
        l.peak_viewers,
        l.actual_start_time,
        s.id as seller_id,
        s.store_name,
        s.store_logo_key
       FROM livestreams l
       JOIN sellers s ON l.seller_id = s.id
       WHERE l.status = 'live'
       ORDER BY l.actual_start_time DESC`
    );

    const livestreamWithUrl = livestreams.map((livestream) => {
      return {
        ...livestream,
        store_logo_key: `https://ipvbxclkwidxsjvdyolb.supabase.co/storage/v1/object/public/vendor-assets/${livestream.store_logo_key}`,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        livestreams: livestreamWithUrl,
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

module.exports = getActiveLivestreams;
