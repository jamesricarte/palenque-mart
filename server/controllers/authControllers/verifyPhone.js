const jwt = require("jsonwebtoken");

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");
const { optStore } = require("../../utils/otpStore");

exports.verifyPhone = async (req, res) => {
  const userData = req.body;

  const formValidation = formValidator.validate(userData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  const phoneStoredOtp = optStore.get(userData.mobileNumber);

  if (!phoneStoredOtp)
    return res.status(400).json({
      message: "The otp has been already expired, please request a new one.",
      success: false,
    });

  if (userData.otp !== phoneStoredOtp.otp)
    return res.status(400).json({ message: "Invalid otp", success: false });

  const [rows] = await db.execute("SELECT * FROM users WHERE phone = ?", [
    userData.mobileNumber,
  ]);

  if (rows.length > 0) {
    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);

    return res.status(200).json({
      message: "OTP was succesfully verified, logging in your account",
      success: true,
      exists: true,
      token: token,
    });
  }

  if ("email" in userData) {
    try {
      const [result] = await db.execute(
        "UPDATE users SET phone = ? WHERE email = ?",
        [userData.mobileNumber, userData.email]
      );

      const [rows] = await db.execute("SELECT id FROM users WHERE email = ?", [
        userData.email,
      ]);

      if (rows.length === 0) {
        return res
          .status(400)
          .json({ message: "User account details is not found." });
      }

      const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);

      return res.status(201).json({
        message: "OTP was succesfully verified, logging in your account",
        success: true,
        exists: true,
        token: token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Something went wrong",
        success: false,
      });
    }
  }

  res.status(200).json({
    message: "OTP was successfully verified",
    success: true,
    exists: false,
    data: {
      mobileNumber: userData.mobileNumber,
    },
  });
};
