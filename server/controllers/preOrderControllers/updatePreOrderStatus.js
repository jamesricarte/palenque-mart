const db = require("../../config/db")

const updatePreOrderStatus = async (req, res) => {
  let connection

  try {
    const { preOrderId } = req.params
    const { status, notes } = req.body
    const userId = req.user.id

    const validStatuses = ["scheduled", "confirmed", "preparing", "ready", "cancelled", "completed"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Verify seller owns this pre-order
    const [preOrderRows] = await connection.execute(
      `SELECT po.*, s.user_id as seller_user_id, p.name as product_name
       FROM pre_orders po
       JOIN sellers s ON po.seller_id = s.id
       JOIN products p ON po.product_id = p.id
       WHERE po.id = ?`,
      [preOrderId],
    )

    if (preOrderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: "Pre-order not found",
      })
    }

    const preOrder = preOrderRows[0]

    if (preOrder.seller_user_id !== userId) {
      await connection.rollback()
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Update pre-order status
    await connection.execute(`UPDATE pre_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      status,
      preOrderId,
    ])

    // Add status history
    await connection.execute(
      `INSERT INTO pre_order_status_history (pre_order_id, status, notes, updated_by) 
       VALUES (?, ?, ?, ?)`,
      [preOrderId, status, notes || `Status updated to ${status}`, userId],
    )

    // If cancelled, release reserved stock
    if (status === "cancelled") {
      await connection.execute(`UPDATE products SET reserved_stock = GREATEST(0, reserved_stock - ?) WHERE id = ?`, [
        preOrder.quantity,
        preOrder.product_id,
      ])

      await connection.execute(`UPDATE pre_orders SET cancelled_at = CURRENT_TIMESTAMP WHERE id = ?`, [preOrderId])
    }

    // If completed, mark completion time
    if (status === "completed") {
      await connection.execute(`UPDATE pre_orders SET completed_at = CURRENT_TIMESTAMP WHERE id = ?`, [preOrderId])
    }

    await connection.commit()

    res.json({
      success: true,
      message: `Pre-order status updated to ${status}`,
      data: {
        preOrderId,
        status,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Update pre-order status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update pre-order status",
      error: { code: "UPDATE_PRE_ORDER_STATUS_ERROR" },
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

module.exports = updatePreOrderStatus
