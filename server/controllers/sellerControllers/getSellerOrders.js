const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getSellerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // First, get the seller_id for this user
    const [sellerRows] = await db.execute(
      "SELECT id FROM sellers WHERE user_id = ? AND is_active = 1",
      [userId]
    );

    if (sellerRows.length === 0) {
      return res.status(404).json({
        message: "Seller profile not found.",
        success: false,
        error: { code: "SELLER_NOT_FOUND" },
      });
    }

    const sellerId = sellerRows[0].id;

    let statusFilter = "";
    const queryParams = [sellerId];

    if (status && status !== "all") {
      if (status === "preorder") {
        statusFilter = "AND o.order_type = 'preorder'";
      } else {
        statusFilter = "AND o.status = ?";
        queryParams.push(status);
      }
    }

    // Get orders that contain items from this seller
    const [orders] = await db.execute(
      `SELECT DISTINCT
        o.id,
        o.order_number,
        o.status,
        o.payment_method,
        o.payment_status,
        o.total_amount,
        o.delivery_recipient_name,
        o.delivery_phone_number,
        o.delivery_street_address,
        o.delivery_barangay,
        o.delivery_city,
        o.delivery_province,
        o.delivery_landmark,
        o.delivery_notes,
        o.created_at,
        o.updated_at,
        o.order_type,
        o.preorder_deposit_paid,
        o.remaining_balance,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        COUNT(oi.id) as item_count,
        SUM(oi.total_price) as seller_total_amount,
        da.id as delivery_assignment_id,
        da.status as delivery_status,
        da.assigned_at,
        dp.partner_id as delivery_partner_id,
        dp.vehicle_type as delivery_vehicle_type,
        dp.rating as delivery_partner_rating,
        du.first_name as delivery_partner_first_name,
        du.last_name as delivery_partner_last_name,
        du.phone as delivery_partner_phone
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.user_id = u.id
      LEFT JOIN delivery_assignments da ON o.id = da.order_id
      LEFT JOIN delivery_partners dp ON da.delivery_partner_id = dp.id
      LEFT JOIN users du ON dp.user_id = du.id
      WHERE oi.seller_id = ? ${statusFilter}
      GROUP BY  o.id, o.order_number, o.status, o.payment_method, o.payment_status, o.total_amount, o.delivery_recipient_name, o.delivery_phone_number,
      o.delivery_street_address, o.delivery_barangay, o.delivery_city,
      o.delivery_province, o.delivery_landmark, o.delivery_notes,
      o.created_at, o.updated_at, o.order_type, o.preorder_deposit_paid, o.remaining_balance, u.first_name, u.last_name,
      da.id, da.status, da.assigned_at,
      dp.partner_id, dp.vehicle_type, dp.rating,
      du.first_name, du.last_name, du.phone
      ORDER BY o.created_at DESC
      LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      queryParams
    );

    // Get order items for each order from this seller
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        let itemsQuery = `SELECT 
            oi.*,
            p.name as product_name,
            p.image_keys,
            p.unit_type`;

        if (order.order_type === "preorder") {
          itemsQuery += `,
            pi.expected_availability_date,
            pi.deposit_amount,
            pi.remaining_balance as preorder_remaining_balance,
            pi.status as preorder_status,
            pi.availability_notified_at
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          LEFT JOIN preorder_items pi ON oi.id = pi.order_item_id`;
        } else {
          itemsQuery += `,
            p.is_preorder_enabled,
            p.expected_availability_date
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id`;
        }

        itemsQuery += `
          WHERE oi.order_id = ? AND oi.seller_id = ?
          ORDER BY oi.created_at`;

        const [items] = await db.execute(itemsQuery, [order.id, sellerId]);

        // Generate public URLs for product images
        const itemsWithImages = items.map((item) => {
          let productImageUrl = null;

          if (item.image_keys) {
            const { data } = supabase.storage
              .from("products")
              .getPublicUrl(item.image_keys);
            productImageUrl = data.publicUrl;
          }

          return {
            ...item,
            image_keys: productImageUrl,
          };
        });

        // Include delivery partner info if available
        const deliveryPartner = order.delivery_partner_id
          ? {
              id: order.delivery_partner_id,
              first_name: order.delivery_partner_first_name,
              last_name: order.delivery_partner_last_name,
              phone: order.delivery_partner_phone,
              vehicle_type: order.delivery_vehicle_type,
              rating: order.delivery_partner_rating,
              assigned_at: order.assigned_at,
            }
          : null;

        return {
          ...order,
          items: itemsWithImages,
          delivery_partner: deliveryPartner,
          delivery_assignment: order.delivery_assignment_id
            ? {
                id: order.delivery_assignment_id,
                status: order.delivery_status,
                assigned_at: order.assigned_at,
              }
            : null,
        };
      })
    );

    // Get total count
    let totalCountStatusFilter = "";
    const countQueryParams = [sellerId];

    if (status && status !== "all") {
      if (status === "preorder") {
        totalCountStatusFilter = "AND o.order_type = 'preorder'";
      } else {
        totalCountStatusFilter = "AND o.status = ?";
        countQueryParams.push(status);
      }
    }

    const [countResult] = await db.execute(
      `SELECT COUNT(DISTINCT o.id) as total 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.seller_id = ? ${totalCountStatusFilter}`,
      countQueryParams
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: { code: "FETCH_ORDERS_ERROR", details: error.message },
    });
  }
};

module.exports = getSellerOrders;
