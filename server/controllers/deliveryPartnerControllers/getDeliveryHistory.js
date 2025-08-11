const db = require("../../config/db");

const getDeliveryHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

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

    const deliveryPartnerId = deliveryPartners[0].id;

    let deliveryHistory = [];

    // Fetch completed delivery assignments (delivered, cancelled)
    let assignmentStatusCondition = "";
    const assignmentParams = [deliveryPartnerId];

    if (status && status !== "all") {
      if (status === "delivered" || status === "cancelled") {
        assignmentStatusCondition = "AND da.status = ?";
        assignmentParams.push(status);
      }
    } else {
      // For "all" or no filter, get delivered and cancelled
      assignmentStatusCondition = "AND da.status IN ('delivered', 'cancelled')";
    }

    const [completedAssignments] = await db.execute(
      `SELECT 
        da.id as assignment_id,
        da.order_id,
        da.status,
        da.delivery_fee,
        da.assigned_at,
        da.pickup_time,
        da.delivery_time,
        da.pickup_address,
        da.delivery_address,
        da.updated_at,
        o.order_number,
        o.total_amount,
        o.delivery_recipient_name,
        o.delivery_phone_number,
        o.delivery_street_address,
        o.delivery_barangay,
        o.delivery_city,
        COUNT(oi.id) as item_count,
        'assignment' as source_type
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      JOIN order_items oi ON o.id = oi.order_id
      WHERE da.delivery_partner_id = ? ${assignmentStatusCondition}
      GROUP BY da.id, da.order_id, da.status, da.delivery_fee, da.assigned_at,
               da.pickup_time, da.delivery_time, da.pickup_address, da.delivery_address,
               da.updated_at, o.order_number, o.total_amount, o.delivery_recipient_name,
               o.delivery_phone_number, o.delivery_street_address, o.delivery_barangay, o.delivery_city`,
      assignmentParams
    );

    deliveryHistory = [...completedAssignments];

    // Fetch declined/expired delivery candidates
    let candidateStatusCondition = "";
    const candidateParams = [deliveryPartnerId];

    if (status && status !== "all") {
      if (status === "declined" || status === "expired") {
        candidateStatusCondition = "AND dc.status = ?";
        candidateParams.push(status);
      }
    } else {
      // For "all" or no filter, get declined and expired
      candidateStatusCondition = "AND dc.status IN ('declined', 'expired')";
    }

    if (
      !status ||
      status === "all" ||
      status === "declined" ||
      status === "expired"
    ) {
      const [declinedExpiredCandidates] = await db.execute(
        `SELECT 
          da.id as assignment_id,
          da.order_id,
          dc.status,
          da.delivery_fee,
          dc.notified_at as assigned_at,
          NULL as pickup_time,
          NULL as delivery_time,
          da.pickup_address,
          da.delivery_address,
          dc.updated_at,
          o.order_number,
          o.total_amount,
          o.delivery_recipient_name,
          o.delivery_phone_number,
          o.delivery_street_address,
          o.delivery_barangay,
          o.delivery_city,
          COUNT(oi.id) as item_count,
          'candidate' as source_type
        FROM delivery_candidates dc
        JOIN delivery_assignments da ON dc.assignment_id = da.id
        JOIN orders o ON da.order_id = o.id
        JOIN order_items oi ON o.id = oi.order_id
        WHERE dc.delivery_partner_id = ? ${candidateStatusCondition}
        GROUP BY da.id, da.order_id, dc.status, da.delivery_fee, dc.notified_at,
                 da.pickup_address, da.delivery_address, dc.updated_at, o.order_number, 
                 o.total_amount, o.delivery_recipient_name, o.delivery_phone_number, 
                 o.delivery_street_address, o.delivery_barangay, o.delivery_city`,
        candidateParams
      );

      deliveryHistory = [...deliveryHistory, ...declinedExpiredCandidates];
    }

    // Sort by updated_at timestamp (most recent first)
    deliveryHistory.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );

    // Apply pagination
    const paginatedHistory = deliveryHistory.slice(
      offset,
      offset + Number.parseInt(limit)
    );
    const total = deliveryHistory.length;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Delivery history retrieved successfully",
      success: true,
      data: {
        deliveries: paginatedHistory,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching delivery history:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
};

module.exports = getDeliveryHistory;
