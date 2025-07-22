const db = require("../../config/db");

const validateVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !subtotal) {
      return res.status(400).json({
        success: false,
        message: "Voucher code and subtotal are required",
      });
    }

    const [voucherRows] = await db.execute(
      `SELECT * FROM vouchers WHERE code = ? AND is_active = 1 
       AND valid_from <= NOW() AND valid_until >= NOW()`,
      [code]
    );

    if (voucherRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired voucher code",
      });
    }

    const voucher = voucherRows[0];

    // Check minimum order amount
    if (parseFloat(subtotal) < parseFloat(voucher.minimum_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₱${voucher.minimum_order_amount} required`,
      });
    }

    // Check usage limit
    if (
      voucher.usage_limit !== null &&
      voucher.used_count >= voucher.usage_limit
    ) {
      return res.status(400).json({
        success: false,
        message: "Voucher usage limit exceeded",
      });
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discount_type === "percentage") {
      discount =
        (parseFloat(subtotal) * parseFloat(voucher.discount_value)) / 100;
      if (voucher.maximum_discount_amount) {
        discount = Math.min(
          discount,
          parseFloat(voucher.maximum_discount_amount)
        );
      }
    } else {
      discount = parseFloat(voucher.discount_value);
    }

    res.json({
      success: true,
      data: {
        voucher: {
          id: voucher.id,
          code: voucher.code,
          title: voucher.title,
          description: voucher.description,
          discount_type: voucher.discount_type,
          discount_value: voucher.discount_value,
          calculated_discount: discount,
        },
      },
    });
  } catch (error) {
    console.error("Error validating voucher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate voucher",
    });
  }
};

module.exports = validateVoucher;
