const db = require("../../config/db")

const createPreOrder = async (req, res) => {
  let connection

  try {
    console.log("Pre-order creation started with body:", req.body)
    console.log("User ID:", req.user.id)

    const {
      productId,
      quantity,
      scheduledDate,
      deliveryAddressId,
      deliveryRecipientName,
      deliveryPhoneNumber,
      deliveryStreetAddress,
      deliveryBarangay,
      deliveryCity,
      deliveryProvince,
      deliveryPostalCode,
      deliveryLandmark,
      deliveryNotes,
      specialInstructions,
      voucherId,
      paymentMethod = "cash_on_delivery",
    } = req.body

    const userId = req.user.id

    // ------------------------------
    // VALIDATION LOGIC HERE
    // ------------------------------
    const validationErrors = []

    // Helper: Check if value is missing or empty
    const isEmpty = (value) =>
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")

    // Validate product ID
    if (isEmpty(productId)) validationErrors.push("Product ID is required")

    // Validate quantity
    if (isEmpty(quantity) || isNaN(quantity) || quantity <= 0) {
      validationErrors.push("Valid quantity is required")
    }

    // Validate scheduled date
    if (isEmpty(scheduledDate)) validationErrors.push("Scheduled date is required")

    // Validate delivery recipient name
    if (isEmpty(deliveryRecipientName)) validationErrors.push("Delivery recipient name is required")

    // Validate delivery phone number — must be numeric, 10-13 digits, optional +63 or +XX
    const phoneRegex = /^(\+?\d{10,13})$/
    if (isEmpty(deliveryPhoneNumber) || !phoneRegex.test(String(deliveryPhoneNumber))) {
      validationErrors.push("Valid phone number is required")
    }

    // Validate street address
    if (isEmpty(deliveryStreetAddress)) validationErrors.push("Delivery street address is required")

    // Validate barangay
    if (isEmpty(deliveryBarangay)) validationErrors.push("Barangay is required")

    // Validate city
    if (isEmpty(deliveryCity)) validationErrors.push("City is required")

    // Validate province
    if (isEmpty(deliveryProvince)) validationErrors.push("Province is required")

    console.log(" Validation errors:", validationErrors)

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      })
    }

    // Check if scheduled date is in the future
    const scheduledDateTime = new Date(scheduledDate)
    const now = new Date()
    console.log(" Scheduled date:", scheduledDateTime, "Current date:", now)

    if (scheduledDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date must be in the future",
      })
    }

    console.log("Getting database connection...")
    connection = await db.getConnection()
    await connection.beginTransaction()

    console.log("Querying product details for productId:", productId)
    // Get product details and check pre-order availability
    const [productRows] = await connection.execute(
      `SELECT p.*, s.id as seller_id, s.user_id as seller_user_id 
       FROM products p 
       JOIN sellers s ON p.seller_id = s.id 
       WHERE p.id = ? AND p.is_active = 1 AND p.pre_order_enabled = 1`,
      [productId],
    )

    console.log("Product query result:", productRows.length, "rows found")

    if (productRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: "Product not found or pre-ordering not available",
      })
    }

    const product = productRows[0]
    console.log("Product found:", product.name, "Pre-order enabled:", product.pre_order_enabled)

    // Check maximum pre-order quantity limit
    if (product.max_pre_order_quantity && quantity > product.max_pre_order_quantity) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: `Maximum pre-order quantity is ${product.max_pre_order_quantity}`,
      })
    }

    // Calculate expected ship date based on lead time
    const expectedShipDate = new Date(scheduledDateTime)
    expectedShipDate.setHours(expectedShipDate.getHours() - (product.pre_order_lead_time || 24))

    const formattedScheduledDate = scheduledDateTime.toISOString().slice(0, 19).replace("T", " ")
    const formattedExpectedShipDate = expectedShipDate.toISOString().slice(0, 19).replace("T", " ")

    console.log(
      "Formatted dates - Scheduled:",
      formattedScheduledDate,
      "Expected ship:",
      formattedExpectedShipDate,
    )

    // Calculate amounts
    const unitPrice = product.price
    const totalAmount = unitPrice * quantity
    let depositAmount = 0
    let remainingAmount = totalAmount

    if (product.deposit_required) {
      depositAmount = (totalAmount * product.deposit_percentage) / 100
      remainingAmount = totalAmount - depositAmount
    }

    // Apply voucher if provided
    let voucherDiscount = 0
    if (voucherId) {
      const [voucherRows] = await connection.execute(
        `SELECT * FROM vouchers 
         WHERE id = ? AND is_active = 1 
         AND valid_from <= NOW() AND valid_until >= NOW()
         AND (usage_limit IS NULL OR used_count < usage_limit)
         AND ? >= minimum_order_amount`,
        [voucherId, totalAmount],
      )

      if (voucherRows.length > 0) {
        const voucher = voucherRows[0]
        if (voucher.discount_type === "percentage") {
          voucherDiscount = (totalAmount * voucher.discount_value) / 100
          if (voucher.maximum_discount_amount) {
            voucherDiscount = Math.min(voucherDiscount, voucher.maximum_discount_amount)
          }
        } else {
          voucherDiscount = voucher.discount_value
        }
      }
    }

    const finalAmount = totalAmount - voucherDiscount
    const finalRemainingAmount = finalAmount - depositAmount

    const initialPaymentStatus = product.deposit_required ? "pending" : "pending"

    // Generate pre-order number
    const preOrderNumber = `PRE${Date.now()}${Math.floor(Math.random() * 1000)}`

    console.log("About to insert pre-order with values:", {
      userId,
      sellerId: product.seller_id,
      productId,
      preOrderNumber,
      quantity,
      unitPrice,
      finalAmount,
      depositAmount,
      finalRemainingAmount,
      formattedScheduledDate,
      formattedExpectedShipDate,
      leadTime: product.pre_order_lead_time,
      paymentStatus: initialPaymentStatus,
    })

    // Create pre-order
    const [preOrderResult] = await connection.execute(
      `INSERT INTO pre_orders (
        user_id, seller_id, product_id, pre_order_number, quantity, unit_price, 
        total_amount, deposit_amount, remaining_amount, scheduled_date, expected_ship_date,
        preparation_lead_time, delivery_address_id, delivery_recipient_name, 
        delivery_phone_number, delivery_street_address, delivery_barangay, 
        delivery_city, delivery_province, delivery_postal_code, delivery_landmark,
        delivery_notes, special_instructions, voucher_id, voucher_discount, 
        payment_method, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        product.seller_id,
        productId,
        preOrderNumber,
        quantity,
        unitPrice,
        finalAmount,
        depositAmount,
        finalRemainingAmount,
        formattedScheduledDate,
        formattedExpectedShipDate,
        product.pre_order_lead_time,
        deliveryAddressId,
        deliveryRecipientName,
        deliveryPhoneNumber,
        deliveryStreetAddress,
        deliveryBarangay,
        deliveryCity,
        deliveryProvince,
        deliveryPostalCode,
        deliveryLandmark,
        deliveryNotes,
        specialInstructions,
        voucherId,
        voucherDiscount,
        paymentMethod,
        "scheduled",
        initialPaymentStatus,
      ],
    )

    const preOrderId = preOrderResult.insertId

    // Add status history
    await connection.execute(
      `INSERT INTO pre_order_status_history (pre_order_id, status, notes) 
       VALUES (?, ?, ?)`,
      [preOrderId, "scheduled", "Pre-order placed successfully"],
    )

    // Update reserved stock
    await connection.execute(`UPDATE products SET reserved_stock = reserved_stock + ? WHERE id = ?`, [
      quantity,
      productId,
    ])

    // Update voucher usage if applied
    if (voucherId && voucherDiscount > 0) {
      await connection.execute(`UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?`, [voucherId])
    }

    await connection.commit()

    res.status(201).json({
      success: true,
      message: "Pre-order created successfully",
      data: {
        preOrderId,
        preOrderNumber,
        scheduledDate: formattedScheduledDate,
        expectedShipDate: formattedExpectedShipDate,
        totalAmount: finalAmount,
        depositAmount,
        remainingAmount: finalRemainingAmount,
        status: "scheduled",
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Create pre-order error details:", error)
    console.error("Error stack:", error.stack)
    res.status(500).json({
      success: false,
      message: "Failed to create pre-order",
      error: { code: "CREATE_PRE_ORDER_ERROR" },
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

module.exports = createPreOrder
