const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { filter = "all", sort = "newest", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build filter condition
    let filterCondition = "";
    const queryParams = [productId];

    if (filter !== "all" && ["1", "2", "3", "4", "5"].includes(filter)) {
      filterCondition = "AND pr.rating = ?";
      queryParams.push(Number.parseInt(filter));
    }

    // Build sort condition
    let sortCondition = "ORDER BY pr.created_at DESC";
    switch (sort) {
      case "oldest":
        sortCondition = "ORDER BY pr.created_at ASC";
        break;
      case "highest":
        sortCondition = "ORDER BY pr.rating DESC, pr.created_at DESC";
        break;
      case "lowest":
        sortCondition = "ORDER BY pr.rating ASC, pr.created_at DESC";
        break;
      case "helpful":
        sortCondition = "ORDER BY pr.helpful_count DESC, pr.created_at DESC";
        break;
      default:
        sortCondition = "ORDER BY pr.created_at DESC";
    }

    const [reviews] = await db.execute(
      `SELECT 
        pr.*,
        u.first_name,
        u.last_name,
        u.profile_picture
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = ? ${filterCondition}
      ${sortCondition}
      LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      queryParams
    );

    const userReviewsMap = new Map();

    for (const review of reviews) {
      if (!userReviewsMap.has(review.user_id)) {
        // Get all reviews from this user for this product
        const [allUserReviews] = await db.execute(
          `SELECT pr.*, u.first_name, u.last_name, u.profile_picture
           FROM product_reviews pr
           JOIN users u ON pr.user_id = u.id
           WHERE pr.product_id = ? AND pr.user_id = ?
           ORDER BY pr.created_at DESC`,
          [productId, review.user_id]
        );

        userReviewsMap.set(review.user_id, allUserReviews);
      }
    }

    // Get media for each review and process user reviews
    const processedReviews = [];

    for (const [userId, userReviews] of userReviewsMap) {
      const latestReview = userReviews[0];
      const pastReviews = userReviews.slice(1);

      // Get media for latest review
      const [media] = await db.execute(
        `SELECT * FROM review_media WHERE review_id = ? AND review_type = 'product'`,
        [latestReview.id]
      );

      // Generate public URLs for media
      const mediaWithUrls = media.map((item) => {
        const { data } = supabase.storage
          .from("review-media")
          .getPublicUrl(item.storage_key);

        return {
          ...item,
          url: data.publicUrl,
        };
      });

      // Generate profile picture URL
      let profilePictureUrl = null;
      if (latestReview.profile_picture) {
        const { data } = supabase.storage
          .from("user-profiles")
          .getPublicUrl(latestReview.profile_picture);
        profilePictureUrl = data.publicUrl;
      }

      // Process past reviews with media
      const pastReviewsWithMedia = await Promise.all(
        pastReviews.map(async (pastReview) => {
          const [pastMedia] = await db.execute(
            `SELECT * FROM review_media WHERE review_id = ? AND review_type = 'product'`,
            [pastReview.id]
          );

          const pastMediaWithUrls = pastMedia.map((item) => {
            const { data } = supabase.storage
              .from("review-media")
              .getPublicUrl(item.storage_key);

            return {
              ...item,
              url: data.publicUrl,
            };
          });

          return {
            ...pastReview,
            media: pastMediaWithUrls,
          };
        })
      );

      processedReviews.push({
        ...latestReview,
        profile_picture: profilePictureUrl,
        media: mediaWithUrls,
        pastReviews: pastReviewsWithMedia,
        totalUserReviews: userReviews.length,
      });
    }

    let countFilterCondition = "";
    if (filterCondition) {
      countFilterCondition = "AND rating = ?";
    }

    const [countResult] = await db.execute(
      `SELECT COUNT(DISTINCT user_id) as total FROM product_reviews WHERE product_id = ? ${countFilterCondition}`,
      queryParams
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Product reviews fetched successfully",
      data: {
        reviews: processedReviews,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product reviews",
      error: error.message,
    });
  }
};

module.exports = getProductReviews;
