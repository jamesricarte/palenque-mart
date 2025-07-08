const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

exports.login = async (req, res) => {
  const loginData = req.body;

  const formValidation = formValidator.validate(loginData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^\+?[0-9]{10,15}$/;
  const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;

  let column;

  if (emailRegex.test(loginData.phoneEmail)) {
    column = "email";
  } else if (mobileRegex.test(loginData.phoneEmail)) {
    column = "phone";
  } else {
    return res
      .status(400)
      .json({ message: "You have entered an invalid input.", success: false });
  }

  try {
    const [rows] = await db.execute(`SELECT * FROM users WHERE ${column} = ?`, [
      loginData.phoneEmail,
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    const userPassword = rows[0].password;
    const { password, ...fetchedUser } = rows[0];

    const passwordMatch = await bcrypt.compare(
      loginData.password,
      userPassword
    );

    if (passwordMatch) {
      const token = jwt.sign({ id: fetchedUser.id }, process.env.JWT_SECRET);

      res.status(200).json({
        message: "Login successfull!",
        success: true,
        data: { user: fetchedUser, token: token },
      });
    } else {
      res.status(200).json({ message: "Incorrect password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};
