const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

module.exports = checkEmail = async (req, res) => {
  const { email, editing, id } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  if (editing) {
    try {
      const [result] = await db.execute(
        "UPDATE users SET email = ? WHERE id = ?",
        [email, id]
      );

      const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);

      if (rows.length === 0) {
        return res.status(400).json({
          message: "User account was unfortunately not found.",
          success: false,
        });
      }

      const { password, ...userData } = rows[0];

      return res.status(200).json({
        message: "Email was updated successfully!",
        success: true,
        exists: true,
        editing: true,
        data: userData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (rows.length === 0) {
        return res.status(200).json({
          message: "Email is not yet registered",
          success: true,
          exists: false,
          data: { email: email },
        });
      }

      const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);

      res.status(200).json({
        devMessage: "Email is already registered",
        message: "Logged in successfully!",
        success: true,
        exists: true,
        token: token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
