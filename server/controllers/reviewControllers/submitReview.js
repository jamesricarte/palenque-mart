const db = require("../../config/db");
const supabase = require("../../config/supabase");
const { v4: uuidv4 } = require("uuid");

const BUCKET_NAME = "review-media";

const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      productRating,
      productReviewText,
      sellerRating,
      sellerReviewText,
      sellerServiceAspects,
      orderId,
      isEditing, // Add isEditing flag
    } = req.body;

    if (
      (!productRating || productRating === "0") &&
      (!sellerRating || sellerRating === "0")
    ) {
      return res.status(400).json({
        success: false,
        message: "At least product rating or seller rating is required",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Verify order exists and belongs to user
    const [orderCheck] = await db.execute(
      `SELECT o.id, o.status, o.delivered_at, oi.product_id, oi.seller_id
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ? AND o.user_id = ? AND o.status = 'delivered'`,
      [orderId, userId]
    );

    if (orderCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not eligible for review",
      });
    }

    const order = orderCheck[0];

    // Check if review time limit (2 days) has passed
    const deliveryDate = new Date(order.delivered_at);
    const now = new Date();
    const diffInDays = (now - deliveryDate) / (1000 * 60 * 60 * 24);

    if (diffInDays > 2) {
      return res.status(400).json({
        success: false,
        message: "Review time limit has expired (2 days after delivery)",
      });
    }

    const [existingProductReview] = await db.execute(
      `SELECT id FROM product_reviews WHERE user_id = ? AND order_id = ?`,
      [userId, orderId]
    );

    const [existingSellerReview] = await db.execute(
      `SELECT id FROM seller_reviews WHERE user_id = ? AND order_id = ?`,
      [userId, orderId]
    );

    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let productReviewId = null;
      let sellerReviewId = null;

      if (
        productRating &&
        productRating !== "0" &&
        existingProductReview.length === 0
      ) {
        const [productReviewResult] = await db.execute(
          `INSERT INTO product_reviews (product_id, user_id, order_id, rating, review_text, is_verified_purchase)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [
            order.product_id,
            userId,
            orderId,
            productRating,
            productReviewText || null,
          ]
        );
        productReviewId = productReviewResult.insertId;
      }

      if (
        sellerRating &&
        sellerRating !== "0" &&
        existingSellerReview.length === 0
      ) {
        const [sellerReviewResult] = await db.execute(
          `INSERT INTO seller_reviews (seller_id, user_id, order_id, rating, review_text, service_aspects)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            order.seller_id,
            userId,
            orderId,
            sellerRating,
            sellerReviewText || null,
            typeof sellerServiceAspects === "object"
              ? JSON.stringify(sellerServiceAspects)
              : sellerServiceAspects,
          ]
        );
        sellerReviewId = sellerReviewResult.insertId;
      }

      if (req.files && req.files.reviewMedia && productReviewId) {
        const mediaFiles = Array.isArray(req.files.reviewMedia)
          ? req.files.reviewMedia
          : [req.files.reviewMedia];

        for (const file of mediaFiles) {
          // Check file size limit (10MB)
          const fileSizeInMB = file.size / (1024 * 1024);
          if (fileSizeInMB > 10) {
            throw new Error(`File ${file.originalname} exceeds 10MB limit`);
          }

          const fileName = `${uuidv4()}-${file.originalname}`;
          const filePath = `user_${userId}/order_${orderId}/${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
            });

          if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            throw new Error("Failed to upload review media");
          }

          // Determine media type
          const mediaType = file.mimetype.startsWith("video/")
            ? "video"
            : "image";

          // Insert media record for product review
          await db.execute(
            `INSERT INTO review_media (review_id, review_type, media_type, storage_key, file_name, file_size, mime_type)
             VALUES (?, 'product', ?, ?, ?, ?, ?)`,
            [
              productReviewId,
              mediaType,
              filePath,
              file.originalname,
              file.size,
              file.mimetype,
            ]
          );
        }
      }

      // Update product average rating and review count
      if (productReviewId) {
        await db.execute(
          `UPDATE products SET 
           average_rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = ?),
           review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = ?)
           WHERE id = ?`,
          [order.product_id, order.product_id, order.product_id]
        );
      }

      // Update seller average rating and review count
      if (sellerReviewId) {
        await db.execute(
          `UPDATE sellers SET 
           average_rating = (SELECT AVG(rating) FROM seller_reviews WHERE seller_id = ?),
           review_count = (SELECT COUNT(*) FROM seller_reviews WHERE seller_id = ?)
           WHERE id = ?`,
          [order.seller_id, order.seller_id, order.seller_id]
        );
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message:
          isEditing === "true"
            ? "Review updated successfully"
            : "Review submitted successfully",
        data: {
          productReviewId,
          sellerReviewId,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

module.exports = submitReview;
