const db = require("../../config/db");

const updateAssignmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId, status } = req.body;

    if (!assignmentId || !status) {
      return res.status(400).json({
        message: "Assignment ID and status are required",
        success: false,
        error: { code: "MISSING_REQUIRED_FIELDS" },
      });
    }

    // Validate status
    const validStatuses = [
      "rider_assigned",
      "picked_up",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        success: false,
        error: { code: "INVALID_STATUS" },
      });
    }

    // Get delivery partner ID
    const [deliveryPartners] = await db.execute(
      "SELECT id FROM delivery_partners WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (deliveryPartners.length === 0) {
      return res.status(404).json({
        message: "Delivery partner profile not found",
        success: false,
        error: { code: "PROFILE_NOT_FOUND" },
      });
    }

    const partnerId = deliveryPartners[0].id;

    // Check if assignment belongs to this delivery partner
    const [assignments] = await db.execute(
      "SELECT id, order_id, status as current_status FROM delivery_assignments WHERE id = ? AND delivery_partner_id = ?",
      [assignmentId, partnerId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        message: "Assignment not found or not assigned to you",
        success: false,
        error: { code: "ASSIGNMENT_NOT_FOUND" },
      });
    }

    const assignment = assignments[0];

    // Update assignment status
    const updateFields = ["status = ?"];
    const updateValues = [status];

    if (status === "picked_up") {
      updateFields.push("pickup_time = CURRENT_TIMESTAMP");
    } else if (status === "delivered") {
      updateFields.push("delivery_time = CURRENT_TIMESTAMP");
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(assignmentId);

    await db.execute(
      `UPDATE delivery_assignments SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Update order status accordingly
    let orderStatus = status;
    if (status === "rider_assigned") {
      orderStatus = "rider_assigned";
    } else if (status === "picked_up") {
      orderStatus = "out_for_delivery";
    } else if (status === "delivered") {
      orderStatus = "delivered";
    } else if (status === "cancelled") {
      orderStatus = "cancelled";
    }

    // If order status is delivered, update the delivered_at timestamp
    const ordersDeliveredAtUpdate =
      orderStatus === "delivered"
        ? ", delivered_at = CURRENT_TIMESTAMP, payment_status = 'paid'"
        : "";

    await db.execute(
      `UPDATE orders SET status = ?${ordersDeliveredAtUpdate} WHERE id = ?`,
      [orderStatus, assignment.order_id]
    );

    // Update order items statuses to status update
    await db.execute(
      "UPDATE order_items SET item_status = ? WHERE order_id = ?",
      [orderStatus, assignment.order_id]
    );

    // If delivered or cancelled, update delivery partner status back to available
    if (status === "delivered" || status === "cancelled") {
      await db.execute(
        "UPDATE delivery_partners SET status = 'available' WHERE id = ?",
        [partnerId]
      );
    }

    // If delivered, upd

    // Get the seller id of the assignment to send to websocket
    const [sellerIdRows] = await db.execute(
      `SELECT o.seller_id FROM delivery_assignments da JOIN orders o ON da.order_id = o.id  WHERE da.id = ? LIMIT 1`,
      [assignmentId]
    );

    const sellerId = sellerIdRows[0].seller_id;
    const sellers = req.app.get("sellers");

    const refreshNotification = {
      type: "REFRESH_SELLER_ORDERS",
      message: "Updated order's status",
    };

    const sellerSocket = sellers.get(sellerId);

    if (sellerSocket && sellerSocket.socket.readyState === 1) {
      sellerSocket.socket.send(JSON.stringify(refreshNotification));
      console.log(`Sent refresh notification to seller id: ${sellerId}`);
    }

    res.status(200).json({
      message: "Assignment status updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating assignment status:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = updateAssignmentStatus;
