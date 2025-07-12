const db = require("../../config/db");
const sendOTP = require("../../utils/sendOTP");
const formValidator = require("../../utils/formValidator");

module.exports = sendOtp = async (req, res) => {
  const { mobileNumber, editing } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  if (editing) {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE phone = ?", [
        mobileNumber,
      ]);

      if (rows.length > 0) {
        return res.status(400).json({
          message: "This phone number was already used.",
          success: false,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(200).json({ message: "Something went wrong" });
    }
  }

  sendOTP(mobileNumber);

  res.status(200).json({
    message: "A new 6-digit code was sent to your mobile number.",
    success: true,
    data: { mobileNumber: mobileNumber },
  });
};
