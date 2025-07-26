const db = require("../../config/db");

const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided",
        error: { code: "INVALID_STATUS" },
      });
    }

    // First, get the seller_id for this user
    const [sellerRows] = await db.execute(
      "SELECT id FROM sellers WHERE user_id = ? AND is_active = 1",
      [userId]
    );

    if (sellerRows.length === 0) {
      return res.status(404).json({
        message: "Seller profile not found.",
        success: false,
        error: { code: "SELLER_NOT_FOUND" },
      });
    }

    const sellerId = sellerRows[0].id;

    // Check if the order contains items from this seller
    const [orderCheck] = await db.execute(
      `SELECT DISTINCT o.id, o.status as current_status
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ? AND oi.seller_id = ?`,
      [orderId, sellerId]
    );

    if (orderCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission to update it",
        error: { code: "ORDER_NOT_FOUND" },
      });
    }

    const currentStatus = orderCheck[0].current_status;

    // Prevent invalid status transitions
    const statusTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready_for_pickup", "cancelled"],
      ready_for_pickup: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered", "cancelled"],
      delivered: [], // Final state
      cancelled: [], // Final state
    };

    if (!statusTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`,
        error: { code: "INVALID_STATUS_TRANSITION" },
      });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update order status
      await db.execute(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, orderId]
      );

      await db.execute(
        "UPDATE order_items SET item_status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND seller_id = ?",
        [status, orderId, sellerId]
      );

      // Add to status history
      await db.execute(
        "INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)",
        [
          orderId,
          status,
          notes || `Status updated to ${status} by seller`,
          userId,
        ]
      );

      // Set delivered timestamp if status is delivered
      if (status === "delivered") {
        await db.execute(
          "UPDATE orders SET delivered_at = CURRENT_TIMESTAMP WHERE id = ?",
          [orderId]
        );
      }

      // Set cancelled timestamp if status is cancelled
      if (status === "cancelled") {
        await db.execute(
          "UPDATE orders SET cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = ? WHERE id = ?",
          [notes || "Cancelled by seller", orderId]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: {
          orderId,
          newStatus: status,
          notes: notes || `Status updated to ${status} by seller`,
        },
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: { code: "UPDATE_STATUS_ERROR", details: error.message },
    });
  }
};

module.exports = updateOrderStatus;
