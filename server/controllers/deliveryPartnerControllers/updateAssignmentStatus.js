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

    // Validate status - now includes accept and decline
    const validStatuses = [
      "accept",
      "decline",
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

    if (status === "accept" || status === "decline") {
      // Check if assignment exists and is available, and if this partner is a candidate
      const [assignments] = await db.execute(
        `SELECT da.id, da.order_id 
         FROM delivery_assignments da
         JOIN delivery_candidates dc ON da.id = dc.assignment_id
         WHERE da.id = ? AND da.status = 'looking_for_rider' AND da.delivery_partner_id IS NULL
         AND dc.delivery_partner_id = ? AND dc.status = 'pending'`,
        [assignmentId, partnerId]
      );

      if (assignments.length === 0) {
        return res.status(404).json({
          message:
            "Assignment not found, already assigned, or you are not a candidate",
          success: false,
          error: { code: "ASSIGNMENT_NOT_AVAILABLE" },
        });
      }

      const assignment = assignments[0];

      if (status === "accept") {
        // Update assignment with delivery partner and status
        await db.execute(
          "UPDATE delivery_assignments SET delivery_partner_id = ?, status = 'rider_assigned', assigned_at = CURRENT_TIMESTAMP WHERE id = ?",
          [partnerId, assignmentId]
        );

        // Update order status to rider_assigned
        await db.execute(
          "UPDATE orders SET status = 'rider_assigned' WHERE id = ?",
          [assignment.order_id]
        );

        // Update order items statuses to rider_assigned
        await db.execute(
          "UPDATE order_items SET item_status = 'rider_assigned' WHERE order_id = ?",
          [assignment.order_id]
        );

        // Update delivery partner status to occupied
        await db.execute(
          "UPDATE delivery_partners SET status = 'occupied' WHERE id = ?",
          [partnerId]
        );

        // Update the accepted candidate status and set other candidates to expired
        await db.execute(
          "UPDATE delivery_candidates SET status = 'accepted', responded_at = CURRENT_TIMESTAMP WHERE assignment_id = ? AND delivery_partner_id = ?",
          [assignmentId, partnerId]
        );

        await db.execute(
          "UPDATE delivery_candidates SET status = 'expired', responded_at = CURRENT_TIMESTAMP WHERE assignment_id = ? AND delivery_partner_id != ? AND status = 'pending'",
          [assignmentId, partnerId]
        );
      } else if (status === "decline") {
        // Update the declined candidate status
        await db.execute(
          "UPDATE delivery_candidates SET status = 'declined', responded_at = CURRENT_TIMESTAMP WHERE assignment_id = ? AND delivery_partner_id = ?",
          [assignmentId, partnerId]
        );
      }

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

      const successMessage =
        status === "accept"
          ? "Delivery assignment accepted successfully"
          : "Delivery assignment declined successfully";

      return res.status(200).json({
        message: successMessage,
        success: true,
      });
    }

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
