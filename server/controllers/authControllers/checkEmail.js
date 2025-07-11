const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

module.exports = checkEmail = async (req, res) => {
  const { email } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Email is not yet registered",
        success: true,
        exists: false,
        email: email,
      });
    }

    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: "Email is already registered",
      success: true,
      exists: true,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
