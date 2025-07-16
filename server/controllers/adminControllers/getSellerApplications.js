const db = require("../../config/db");

const getSellerApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const queryParams = [];

    if (status && status !== "all") {
      whereClause = "WHERE sa.status = ?";
      queryParams.push(status);
    }

    const limitInt = Number.parseInt(limit);
    const offsetInt = Number.parseInt(offset);

    const [applications] = await db.execute(
      `
      SELECT 
        sa.id,
        sa.application_id,
        sa.account_type,
        sa.status,
        sa.created_at,
        sa.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        ssp.store_name,
        sbd.business_name
      FROM seller_applications sa
      JOIN users u ON sa.user_id = u.id
      LEFT JOIN seller_store_profiles ssp ON sa.id = ssp.application_id
      LEFT JOIN seller_business_details sbd ON sa.id = sbd.application_id
      ${whereClause}
      ORDER BY sa.created_at DESC
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `,
      queryParams
    );

    // Count query stays same
    const [countResult] = await db.execute(
      `
      SELECT COUNT(*) as total
      FROM seller_applications sa
      ${whereClause}
    `,
      queryParams
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitInt);

    res.status(200).json({
      message: "Seller applications retrieved successfully",
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
    console.error("Error fetching seller applications:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching applications.",
      success: false,
      error: { code: "FETCH_ERROR" },
    });
  }
};

module.exports = getSellerApplications;
