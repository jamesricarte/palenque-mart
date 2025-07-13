const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");
const sendOTP = require("../../utils/sendOTP");

module.exports = signUpMobile = async (req, res) => {
  const { mobileNumber, email, editing } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  if (!mobileNumber) {
    return res
      .status(400)
      .json({ message: "Phone number is required.", success: false });
  }

  if (editing) {
    const [rows] = await db.execute("SELECT id FROM users WHERE phone = ?", [
      mobileNumber,
    ]);

    if (rows.length > 0) {
      return res
        .status(409)
        .json({
          message: "This phone number was already used.",
          success: false,
        });
    }
  }

  try {
    sendOTP(mobileNumber);

    let data = { mobileNumber: mobileNumber };

    if ("email" in req.body) {
      data.email = email;
    }

    return res.status(200).json({
      message: "OTP sent successfully.",
      success: true,
      data,
      signUpOption: "mobileNumber",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP.", success: false });
  }
};
