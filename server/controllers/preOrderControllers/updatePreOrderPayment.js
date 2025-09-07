const db = require("../../config/db")

const updatePreOrderPayment = async (req, res) => {
  let connection

  try {
    const { preOrderId } = req.params
    const { paymentStatus, paymentMethod, transactionId } = req.body
    const userId = req.user.id

    const validPaymentStatuses = ["pending", "deposit_paid", "fully_paid", "refunded"]

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Verify user owns this pre-order
    const [preOrderRows] = await connection.execute(`SELECT * FROM pre_orders WHERE id = ? AND user_id = ?`, [
      preOrderId,
      userId,
    ])

    if (preOrderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: "Pre-order not found",
      })
    }

    const preOrder = preOrderRows[0]

    // Update payment information
    const updateFields = ["payment_status = ?"]
    const updateValues = [paymentStatus]

    if (paymentMethod) {
      updateFields.push("payment_method = ?")
      updateValues.push(paymentMethod)
    }

    updateValues.push(preOrderId)

    await connection.execute(
      `UPDATE pre_orders SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues,
    )

    // Add status history for payment update
    await connection.execute(
      `INSERT INTO pre_order_status_history (pre_order_id, status, notes, updated_by) 
       VALUES (?, ?, ?, ?)`,
      [preOrderId, `payment_${paymentStatus}`, `Payment status updated to ${paymentStatus}`, userId],
    )

    // If fully paid and pre-order is scheduled, move to confirmed
    if (paymentStatus === "fully_paid" && preOrder.status === "scheduled") {
      await connection.execute(`UPDATE pre_orders SET status = 'confirmed' WHERE id = ?`, [preOrderId])

      await connection.execute(
        `INSERT INTO pre_order_status_history (pre_order_id, status, notes, updated_by) 
         VALUES (?, ?, ?, ?)`,
        [preOrderId, "confirmed", "Pre-order confirmed after full payment", userId],
      )
    }

    await connection.commit()

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        preOrderId,
        paymentStatus,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Update pre-order payment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: { code: "UPDATE_PRE_ORDER_PAYMENT_ERROR" },
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

module.exports = updatePreOrderPayment
