const db = require("../../config/db");

const getDeliveryPartnerApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const queryParams = [];

    if (status && status !== "all") {
      whereClause = "WHERE dpa.status = ?";
      queryParams.push(status);
    }

    const limitInt = Number.parseInt(limit);
    const offsetInt = Number.parseInt(offset);

    const [applications] = await db.execute(
      `
      SELECT 
        dpa.id,
        dpa.application_id,
        dpa.vehicle_type,
        dpa.license_number,
        dpa.status,
        dpa.created_at,
        dpa.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM delivery_partner_applications dpa
      JOIN users u ON dpa.user_id = u.id
      ${whereClause}
      ORDER BY dpa.created_at DESC
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `,
      queryParams
    );

    // Get total count
    const [countResult] = await db.execute(
      `
      SELECT COUNT(*) as total
      FROM delivery_partner_applications dpa
      ${whereClause}
    `,
      queryParams
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitInt);

    res.status(200).json({
      message: "Delivery partner applications retrieved successfully",
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: limitInt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching delivery partner applications:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching applications.",
      success: false,
      error: { code: "FETCH_ERROR" },
    });
  }
};

module.exports = getDeliveryPartnerApplications;
