const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");
const sendVerificationEmail = require("../../utils/sendVerificationEmail");
const sendOTP = require("../../utils/sendOTP");

const login = async (req, res) => {
  const { phoneEmail, password, twoFA } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res.status(400).json({
      message: formValidation.message,
      success: false,
      error: formValidation.error,
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^\+[1-9]\d{7,14}$/;

  let column;

  if (emailRegex.test(phoneEmail)) {
    column = "email";
  } else if (mobileRegex.test(phoneEmail)) {
    column = "phone";
  } else {
    return res.status(400).json({
      message: "You have entered an invalid input.",
      success: false,
      error: { code: "INVALID_FORMAT" },
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE ${column} = ? AND is_active = TRUE`,
      [phoneEmail]
    );

    if (rows.length === 0) {
      let data;

      if (column === "email") data = { email: phoneEmail };
      else data = { mobileNumber: phoneEmail };

      return res.status(200).json({
        message: "Invalid credentials",
        success: true,
        exists: false,
        data,
      });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET
      );

      if (twoFA) {
        if (emailRegex.test(phoneEmail)) {
          try {
            await sendVerificationEmail(phoneEmail, "twoFA");

            return res.status(200).json({
              message: "A verification link was sent to your inbox",
              success: true,
              data: { email: phoneEmail },
              twoFA: true,
              exists: true,
            });
          } catch (error) {
            console.error("ERROR SENDING EMAIL", error);

            return res.status(500).json({
              message: "Something went wrong.",
              success: false,
            });
          }
        } else if (mobileRegex.test(phoneEmail)) {
          sendOTP(phoneEmail);

          return res.status(200).json({
            message: "OTP sent successfully.",
            success: true,
            data: { mobileNumber: phoneEmail },
            twoFA: true,
            exists: true,
          });
        }
      }

      res.status(200).json({
        message: "Login successful!",
        success: true,
        data: {
          token: token,
          role: user.role,
          isAdmin: user.role === "admin" || user.role === "super_admin",
        },
        twoFA: false,
        exists: true,
      });
    } else {
      res.status(200).json({
        message: "Incorrect password.",
        success: false,
        error: {
          code: "INCORRECT_PASSWORD",
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

module.exports = login;
