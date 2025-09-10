const db = require("../../config/db");

const cancelOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { orderId } = req.params;
    const cancellationReason = "Cancelled by customer";

    // Get order details to validate cancellation eligibility
    const [orderRows] = await connection.execute(
      `SELECT o.*, oi.product_id, oi.quantity, oi.seller_id
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderRows[0];

    // Check if order can be cancelled (only pending or confirmed orders)
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Check if order is already cancelled
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Update order status to cancelled
    await connection.execute(
      `UPDATE orders 
       SET status = 'cancelled', 
           cancelled_at = NOW(), 
           cancellation_reason = ?,
           updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [cancellationReason, orderId, userId]
    );

    // Restore stock for regular (non-preorder) items
    const regularItems = orderRows.filter((row) => row.product_id); // Filter out null product_ids from JOIN

    for (const item of regularItems) {
      // Check if this is a preorder item
      const [preorderCheck] = await connection.execute(
        `SELECT poi.id FROM preorder_items poi 
         JOIN order_items oi ON poi.order_item_id = oi.id 
         WHERE oi.order_id = ? AND oi.product_id = ?`,
        [orderId, item.product_id]
      );

      // Only restore stock for regular items (not preorders)
      if (preorderCheck.length === 0) {
        await connection.execute(
          `UPDATE products 
           SET stock_quantity = stock_quantity + ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }
    }

    // Update all order items status to cancelled
    await connection.execute(
      `UPDATE order_items 
       SET item_status = 'cancelled', updated_at = NOW()
       WHERE order_id = ?`,
      [orderId]
    );

    // Add cancellation to order status history
    await connection.execute(
      `INSERT INTO order_status_history (order_id, status, notes, updated_by) 
       VALUES (?, 'cancelled', ?, ?)`,
      [orderId, cancellationReason, userId]
    );

    // If order used a voucher, decrease the usage count
    if (order.voucher_id) {
      await connection.execute(
        `UPDATE vouchers 
         SET used_count = GREATEST(used_count - 1, 0) 
         WHERE id = ?`,
        [order.voucher_id]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId: orderId,
        orderNumber: order.order_number,
        cancelledAt: new Date().toISOString(),
        cancellationReason: cancellationReason,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = cancelOrder;
