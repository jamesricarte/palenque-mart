const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");
const sendVerificationEmail = require("../../utils/sendVerificationEmail");
const sendOTP = require("../../utils/sendOTP");

module.exports = login = async (req, res) => {
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
  const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;

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
    const [rows] = await db.execute(`SELECT * FROM users WHERE ${column} = ?`, [
      phoneEmail,
    ]);

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

    const userPassword = rows[0].password;
    const userId = rows[0].id;

    const passwordMatch = await bcrypt.compare(password, userPassword);

    if (passwordMatch) {
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

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
        message: "Login successfull!",
        success: true,
        data: { token: token },
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
