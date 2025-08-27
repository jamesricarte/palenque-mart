const db = require("../../config/db");
const supabase = require("../../config/supabase");

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let statusFilter = "";
    const queryParams = [userId];

    if (status && status !== "all") {
      if (status === "pending") {
        statusFilter = "AND o.status IN (?, ?, ?)";
        queryParams.push("pending", "confirmed", "preparing");
      } else if (status === "on_the_way") {
        statusFilter = "AND o.status IN (?, ?)";
        queryParams.push("rider_assigned", "out_for_delivery");
      } else if (status === "to_review") {
        statusFilter = `AND o.status = 'delivered' 
                        AND o.delivered_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)
                        AND EXISTS (
                          SELECT 1 FROM order_items oi_check
                          WHERE oi_check.order_id = o.id
                          AND ( 
                            NOT EXISTS (
                              SELECT 1 FROM product_reviews pr 
                              WHERE pr.order_id = oi_check.order_id AND pr.user_id = ?
                            ) 
                            OR NOT EXISTS (
                              SELECT 1 FROM seller_reviews sr
                              WHERE sr.seller_id = oi_check.seller_id AND sr.order_id = oi_check.order_id AND sr.user_id = ?
                            )
                          )
                        )`;
        queryParams.push(userId, userId);
      } else {
        statusFilter = "AND o.status = ?";
        queryParams.push(status);
      }
    }

    // Get orders with first store logo and first product details for each order
    const [orders] = await db.execute(
      `SELECT 
        o.*,
        v.code as voucher_code,
        v.title as voucher_title,
        COUNT(oi.id) as item_count,
        GROUP_CONCAT(DISTINCT s.store_name) as store_names,
        (SELECT s2.store_logo_key 
          FROM order_items oi2 
          JOIN sellers s2 ON oi2.seller_id = s2.id 
          WHERE oi2.order_id = o.id 
          LIMIT 1) as first_store_logo_key,
        (SELECT p.name
          FROM order_items oi3
          JOIN products p ON oi3.product_id = p.id
          WHERE oi3.order_id = o.id
          ORDER BY oi3.id
          LIMIT 1) as first_product_name,
        (SELECT p.image_keys
          FROM order_items oi4
          JOIN products p ON oi4.product_id = p.id
          WHERE oi4.order_id = o.id
          ORDER BY oi4.id
          LIMIT 1) as first_product_image_key,
        (SELECT oi5.quantity
          FROM order_items oi5
          WHERE oi5.order_id = o.id
          ORDER BY oi5.id
          LIMIT 1) as first_product_quantity,
        (SELECT oi6.unit_price
          FROM order_items oi6
          WHERE oi6.order_id = o.id
          ORDER BY oi6.id
          LIMIT 1) as first_product_price,
        CASE 
          WHEN o.status = 'delivered' 
                AND o.delivered_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)
                AND EXISTS (
                  SELECT 1 FROM order_items oi_check
                  WHERE oi_check.order_id = o.id
                  AND (
                    NOT EXISTS (
                      SELECT 1 FROM product_reviews pr 
                      WHERE pr.order_id = o.id AND pr.user_id = ?
                    )
                    OR NOT EXISTS (
                      SELECT 1 FROM seller_reviews sr
                      WHERE sr.seller_id = o.seller_id AND sr.order_id = o.id AND sr.user_id = ?
                    )
                  )
                )
          THEN 1 
          ELSE 0 
        END as can_review
        FROM orders o
        LEFT JOIN vouchers v ON o.voucher_id = v.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN sellers s ON oi.seller_id = s.id
        WHERE o.user_id = ? ${statusFilter}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ${Number.parseInt(limit)} OFFSET ${offset}`,
      [userId, userId, ...queryParams]
    );

    // Generate public URLs for store logos and product images
    const ordersWithLogos = await Promise.all(
      orders.map(async (order) => {
        let store_logo_url = null;
        let first_product_image_url = null;

        if (order.first_store_logo_key) {
          const { data } = supabase.storage
            .from("vendor-assets")
            .getPublicUrl(order.first_store_logo_key);

          store_logo_url = data.publicUrl;
        }

        // Get product image URL from Supabase
        if (order.first_product_image_key) {
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(order.first_product_image_key);

          first_product_image_url = data.publicUrl;
        }

        return {
          ...order,
          // Map stored delivery fields to expected field names for backward compatibility
          recipient_name: order.delivery_recipient_name,
          phone_number: order.delivery_phone_number,
          street_address: order.delivery_street_address,
          barangay: order.delivery_barangay,
          city: order.delivery_city,
          province: order.delivery_province,
          landmark: order.delivery_landmark,
          store_logo_url,
          first_product_image_url,
        };
      })
    );

    let totalCountStatusFilter = "";
    const totalCountParams = [userId];

    if (status && status !== "all") {
      if (status === "to_review") {
        totalCountStatusFilter = `AND status = 'delivered' 
                                  AND delivered_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)
                                  AND EXISTS (
                                  SELECT 1 FROM order_items oi_check
                                  WHERE oi_check.order_id = orders.id
                                  AND (
                                    NOT EXISTS (
                                      SELECT 1 FROM product_reviews pr 
                                      WHERE pr.order_id = orders.id AND pr.user_id = ?
                                    )
                                    OR NOT EXISTS (
                                      SELECT 1 FROM seller_reviews sr
                                      WHERE sr.seller_id = orders.seller_id AND sr.order_id = orders.id AND sr.user_id = ?
                                    )
                                  )
                                )`;
        totalCountParams.push(userId, userId);
      } else if (status === "pending") {
        totalCountStatusFilter =
          "AND status IN ('pending', 'confirmed', 'preparing')";
      } else if (status === "on_the_way") {
        totalCountStatusFilter =
          "AND status IN ('rider_assigned', 'out_for_delivery')";
      } else {
        totalCountStatusFilter = "AND status = ?";
        totalCountParams.push(status);
      }
    }

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM orders WHERE user_id = ? ${totalCountStatusFilter}`,
      totalCountParams
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders: ordersWithLogos,
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
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

module.exports = getUserOrders;
