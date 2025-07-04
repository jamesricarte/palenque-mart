const formValidator = require("../../utils/formValidator");
const { optStore } = require("../../utils/otpStore");

exports.signUpMobile = async (req, res) => {
  const signUpData = req.body;

  const formValidation = formValidator.validate(signUpData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  const mobileNumber = signUpData.mobileNumber;

  if (!mobileNumber) {
    return res
      .status(400)
      .json({ message: "Phone number is required.", success: false });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    optStore.set(mobileNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const storedOtp = optStore.get(mobileNumber);

    console.log(`OTP for ${mobileNumber} is: ${storedOtp.otp}`);

    let data = { mobileNumber: mobileNumber };

    if ("email" in signUpData) {
      data.email = signUpData.email;
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
