const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

exports.createAccount = async (req, res) => {
  const createAccountData = req.body;

  const formValidation = formValidator.validate(createAccountData);

  if (!formValidation.validation) {
    console.log(formValidation);
    return res.status(400).json({
      message: formValidation.message,
      success: false,
      error: formValidation?.error,
    });
  }

  if ("email" in createAccountData) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      createAccountData.email,
    ]);

    if (rows.length > 0)
      return res.status(400).json({
        message: "Email already exists",
        exists: true,
        success: false,
      });

    try {
      const hashedPassword = await bcrypt.hash(createAccountData.password, 10);

      const [result] = await db.execute(
        "INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)",
        [
          createAccountData.email,
          createAccountData.firstName,
          createAccountData.lastName,
          hashedPassword,
        ]
      );

      const [user] = await db.execute("SELECT id FROM users WHERE id = ?", [
        result.insertId,
      ]);

      if (user.length === 0) {
        return res.status(400).json({ message: "No user was fetched!" });
      }

      const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET);

      res.status(201).json({
        message: "Account registered successfully!",
        success: true,
        data: { email: createAccountData.email },
        token: token,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Something went wrong.", success: false });
    }
  } else if ("mobileNumber" in createAccountData) {
    const [rows] = await db.execute("SELECT * FROM users WHERE phone = ?", [
      createAccountData.mobileNumber,
    ]);

    if (rows.length > 0)
      return res.status(400).json({
        message: "Mobile number already exists",
        exists: true,
        success: false,
      });

    try {
      const hashedPassword = await bcrypt.hash(createAccountData.password, 10);

      const [result] = await db.execute(
        "INSERT INTO users (phone, first_name, last_name, password) VALUES (?, ?, ?, ?)",
        [
          createAccountData.mobileNumber,
          createAccountData.firstName,
          createAccountData.lastName,
          hashedPassword,
        ]
      );

      const [user] = await db.execute("SELECT id FROM users WHERE id = ?", [
        result.insertId,
      ]);

      if (user.length === 0) {
        return res.status(400).json({ message: "No user was fetched!" });
      }

      const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET);

      res.status(201).json({
        message: "Account registered successfully!",
        success: true,
        data: { mobileNumber: createAccountData.mobileNumber },
        token: token,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Something went wrong.", success: false });
    }
  }
};
