const db = require("../../config/db");

const createOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const userId = req.user.id;
    const {
      items,
      deliveryAddressId,
      deliveryNotes = null,
      voucherCode,
      paymentMethod = "cash_on_delivery",
      clearCart = false,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items provided",
      });
    }

    if (!deliveryAddressId) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // Validate item structure
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid productId and quantity > 0",
        });
      }
    }

    // Verify address belongs to user
    const [addressCheck] = await connection.execute(
      `SELECT id FROM user_addresses WHERE id = ? AND user_id = ?`,
      [deliveryAddressId, userId]
    );

    if (addressCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery address",
      });
    }

    await connection.beginTransaction();

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // Lock row to prevent race condition
      const [productRows] = await connection.execute(
        `SELECT p.*, s.id AS seller_id FROM products p
         JOIN sellers s ON p.seller_id = s.id
         WHERE p.id = ? AND p.is_active = 1 FOR UPDATE`,
        [item.productId]
      );

      if (productRows.length === 0) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      const product = productRows[0];

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = round(product.price * item.quantity);
      subtotal += itemTotal;

      validatedItems.push({
        ...item,
        product,
        itemTotal,
      });
    }

    // Voucher handling
    let voucherId = null;
    let voucherDiscount = 0;

    if (voucherCode) {
      const [voucherRows] = await connection.execute(
        `SELECT * FROM vouchers 
         WHERE code = ? AND is_active = 1 
         AND valid_from <= NOW() AND valid_until >= NOW()`,
        [voucherCode]
      );

      if (voucherRows.length === 0) {
        throw new Error("Invalid or expired voucher");
      }

      const voucher = voucherRows[0];

      if (subtotal < parseFloat(voucher.minimum_order_amount)) {
        throw new Error(
          `Minimum order amount of ₱${voucher.minimum_order_amount} required for this voucher`
        );
      }

      if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        throw new Error("Voucher usage limit exceeded");
      }

      if (voucher.discount_type === "percentage") {
        voucherDiscount = round(
          (subtotal * parseFloat(voucher.discount_value)) / 100
        );

        if (voucher.maximum_discount_amount) {
          voucherDiscount = Math.min(
            voucherDiscount,
            parseFloat(voucher.maximum_discount_amount)
          );
        }
      } else {
        voucherDiscount = parseFloat(voucher.discount_value);
      }

      voucherId = voucher.id;

      // Update voucher usage
      await connection.execute(
        `UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?`,
        [voucher.id]
      );
    }

    const deliveryFee = 50.0;
    const totalAmount = round(subtotal + deliveryFee - voucherDiscount);
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
       (user_id, order_number, subtotal, delivery_fee, voucher_discount, 
        total_amount, voucher_id, delivery_address_id, delivery_notes, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        subtotal,
        deliveryFee,
        voucherDiscount,
        totalAmount,
        voucherId,
        deliveryAddressId,
        deliveryNotes,
        paymentMethod,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of validatedItems) {
      await connection.execute(
        `INSERT INTO order_items 
         (order_id, product_id, seller_id, quantity, unit_price, total_price, preparation_options) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.product.seller_id,
          item.quantity,
          item.product.price,
          item.itemTotal,
          item.preparationOptions
            ? JSON.stringify(item.preparationOptions)
            : null,
        ]
      );

      await connection.execute(
        `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
        [item.quantity, item.productId]
      );
    }

    await connection.execute(
      `INSERT INTO order_status_history (order_id, status, notes) 
       VALUES (?, 'pending', 'Order placed successfully')`,
      [orderId]
    );

    if (clearCart) {
      await connection.execute(`DELETE FROM cart WHERE user_id = ?`, [userId]);
    }

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId,
        orderNumber,
        totalAmount,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// Helper: round to 2 decimals
function round(num) {
  return Math.round(num * 100) / 100;
}

module.exports = createOrder;
