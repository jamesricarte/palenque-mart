const db = require("../../config/db");

const acceptAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
        success: false,
        error: { code: "MISSING_ASSIGNMENT_ID" },
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
      message: "Delivery assignment accepted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error accepting delivery assignment:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = acceptAssignment;
