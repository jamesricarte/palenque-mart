const jwt = require("jsonwebtoken");

const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

exports.profile = async (req, res) => {
  const userData = req.userData;

  const formValidation = formValidator.validate(userData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  const [rows] = await db.execute(
    "SELECT first_name, last_name, email, phone, address FROM users WHERE id = ?",
    [userData.id]
  );

  if (rows.length === 0) {
    return res
      .status(400)
      .json({ message: "user account is not present", succes: false });
  }

  res
    .status(200)
    .json({ message: "Here is your profile!", succes: true, data: rows[0] });
};
