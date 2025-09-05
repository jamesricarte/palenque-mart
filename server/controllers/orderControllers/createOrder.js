const db = require("../../config/db");

const createOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const {
      items,
      deliveryAddressId,
      deliveryNotes = "",
      voucherCode = null,
      paymentMethod = "cash_on_delivery",
      clearCart = false,
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    if (!deliveryAddressId) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // Get delivery address
    const [addressRows] = await connection.execute(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [deliveryAddressId, userId]
    );

    if (addressRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found",
      });
    }

    const deliveryAddress = addressRows[0];

    // Get product details and group by seller
    const productIds = items.map((item) => item.productId);
    const placeholders = productIds.map(() => "?").join(",");

    const [productRows] = await connection.execute(
      `SELECT p.*, s.store_name, s.store_logo_key 
       FROM products p 
       JOIN sellers s ON p.seller_id = s.id 
       WHERE p.id IN (${placeholders}) AND p.is_active = 1`,
      productIds
    );

    if (productRows.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some products are not available",
      });
    }

    // Group items by seller
    const itemsBySeller = {};

    for (const item of items) {
      const product = productRows.find((p) => p.id === item.productId);
      if (!product) continue;

      const sellerId = product.seller_id;
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = {
          seller_id: sellerId,
          store_name: product.store_name,
          store_logo_key: product.store_logo_key,
          items: [],
        };
      }

      // Check stock availability
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
        });
      }

      itemsBySeller[sellerId].items.push({
        ...item,
        product: product,
        unit_price: item.bargain_data?.offer_price || product.price,
        total_price:
          (item.bargain_data?.offer_price || product.price) * item.quantity,
      });
    }

    // Validate voucher if provided
    let appliedVoucher = null;
    if (voucherCode) {
      const [voucherRows] = await connection.execute(
        `SELECT * FROM vouchers 
         WHERE code = ? AND is_active = 1 
         AND valid_from <= NOW() AND valid_until >= NOW()`,
        [voucherCode]
      );

      if (voucherRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired voucher code",
        });
      }

      appliedVoucher = voucherRows[0];
    }

    const deliveryFee = 50.0;
    const createdOrders = [];
    let totalOrderAmount = 0;

    // Create separate order for each seller
    for (const [sellerId, sellerData] of Object.entries(itemsBySeller)) {
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;

      // Calculate subtotal for this seller
      const subtotal = sellerData.items.reduce(
        (sum, item) => sum + item.total_price,
        0
      );

      // Apply voucher discount proportionally if multiple sellers
      let voucherDiscount = 0;
      if (appliedVoucher) {
        const totalSubtotal = Object.values(itemsBySeller).reduce(
          (sum, seller) =>
            sum +
            seller.items.reduce(
              (itemSum, item) => itemSum + item.total_price,
              0
            ),
          0
        );

        if (appliedVoucher.discount_type === "percentage") {
          const discountAmount =
            (subtotal * appliedVoucher.discount_value) / 100;
          voucherDiscount = appliedVoucher.maximum_discount_amount
            ? Math.min(
                discountAmount,
                appliedVoucher.maximum_discount_amount *
                  (subtotal / totalSubtotal)
              )
            : discountAmount;
        } else {
          voucherDiscount =
            appliedVoucher.discount_value * (subtotal / totalSubtotal);
        }
      }

      const totalAmount = subtotal + deliveryFee - voucherDiscount;
      totalOrderAmount += totalAmount;

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          user_id, seller_id, order_number, status, payment_method, payment_status,
          subtotal, delivery_fee, voucher_discount, total_amount, voucher_id,
          delivery_address_id, delivery_recipient_name, delivery_phone_number,
          delivery_street_address, delivery_barangay, delivery_city, 
          delivery_province, delivery_postal_code, delivery_landmark, delivery_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          sellerId,
          orderNumber,
          "pending",
          paymentMethod,
          "pending",
          subtotal,
          deliveryFee,
          voucherDiscount,
          totalAmount,
          appliedVoucher?.id || null,
          deliveryAddressId,
          deliveryAddress.recipient_name,
          deliveryAddress.phone_number,
          deliveryAddress.street_address,
          deliveryAddress.barangay,
          deliveryAddress.city,
          deliveryAddress.province,
          deliveryAddress.postal_code,
          deliveryAddress.landmark,
          deliveryNotes,
        ]
      );

      const orderId = orderResult.insertId;

      // Create order items
      for (const item of sellerData.items) {
        await connection.execute(
          `INSERT INTO order_items (
            order_id, product_id, seller_id, quantity, unit_price, total_price, preparation_options, bargain_offer_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            sellerId,
            item.quantity,
            item.unit_price,
            item.total_price,
            JSON.stringify(item.preparationOptions || {}),
            item.bargain_data?.id || null,
          ]
        );

        // Update product stock
        await connection.execute(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.productId]
        );
      }

      // Add to order status history
      await connection.execute(
        "INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)",
        [orderId, "pending", "Order placed successfully"]
      );

      createdOrders.push({
        orderId: orderId,
        orderNumber: orderNumber,
        sellerId: sellerId,
        storeName: sellerData.store_name,
        totalAmount: totalAmount,
      });
    }

    // Update voucher usage count if applied
    if (appliedVoucher) {
      await connection.execute(
        "UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?",
        [appliedVoucher.id]
      );
    }

    // Clear cart items if requested (from cart checkout)
    if (clearCart) {
      const cartItemIds = items.map((item) => item.productId);
      const cartPlaceholders = cartItemIds.map(() => "?").join(",");
      await connection.execute(
        `DELETE FROM cart WHERE user_id = ? AND product_id IN (${cartPlaceholders})`,
        [userId, ...cartItemIds]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `${createdOrders.length} order${
        createdOrders.length > 1 ? "s" : ""
      } created successfully`,
      data: {
        orders: createdOrders,
        totalAmount: totalOrderAmount,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Helper: round to 2 decimals
function round(num) {
  return Math.round(num * 100) / 100;
}

module.exports = createOrder;
