const sendOTP = require("../../utils/sendOTP");
const formValidator = require("../../utils/formValidator");

module.exports = sendOtp = async (req, res) => {
  const { mobileNumber } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  sendOTP(mobileNumber);

  res
    .status(200)
    .json({
      message: "A new 6-digit code was sent to your mobile number.",
      success: true,
    });
};
