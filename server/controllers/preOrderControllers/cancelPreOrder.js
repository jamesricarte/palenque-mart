const db = require("../../config/db")

const cancelPreOrder = async (req, res) => {
  let connection

  try {
    const { preOrderId } = req.params
    const { cancellationReason } = req.body
    const userId = req.user.id

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Verify user owns this pre-order and it can be cancelled
    const [preOrderRows] = await connection.execute(
      `SELECT po.*, p.name as product_name
       FROM pre_orders po
       JOIN products p ON po.product_id = p.id
       WHERE po.id = ? AND po.user_id = ?`,
      [preOrderId, userId],
    )

    if (preOrderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: "Pre-order not found",
      })
    }

    const preOrder = preOrderRows[0]

    // Check if pre-order can be cancelled
    if (["cancelled", "completed"].includes(preOrder.status)) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: "Pre-order cannot be cancelled",
      })
    }

    // Update pre-order status to cancelled
    await connection.execute(
      `UPDATE pre_orders 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, 
           cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [cancellationReason || "Cancelled by customer", preOrderId],
    )

    // Add status history
    await connection.execute(
      `INSERT INTO pre_order_status_history (pre_order_id, status, notes, updated_by) 
       VALUES (?, ?, ?, ?)`,
      [preOrderId, "cancelled", cancellationReason || "Cancelled by customer", userId],
    )

    // Release reserved stock
    await connection.execute(`UPDATE products SET reserved_stock = GREATEST(0, reserved_stock - ?) WHERE id = ?`, [
      preOrder.quantity,
      preOrder.product_id,
    ])

    // If voucher was used, decrease usage count
    if (preOrder.voucher_id) {
      await connection.execute(`UPDATE vouchers SET used_count = GREATEST(0, used_count - 1) WHERE id = ?`, [
        preOrder.voucher_id,
      ])
    }

    await connection.commit()

    res.json({
      success: true,
      message: "Pre-order cancelled successfully",
      data: {
        preOrderId,
        status: "cancelled",
        cancelledAt: new Date(),
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Cancel pre-order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel pre-order",
      error: { code: "CANCEL_PRE_ORDER_ERROR" },
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

module.exports = cancelPreOrder
