const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

module.exports = profile = async (req, res) => {
  const { id } = req.userData;

  const formValidation = formValidator.validate(req.userData);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  const [rows] = await db.execute(
    "SELECT first_name, last_name, email, phone, address FROM users WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return res
      .status(400)
      .json({ message: "user account is not present", succes: false });
  }

  console.log("User's details fetched!");

  res
    .status(200)
    .json({ message: "Here is your profile!", succes: true, data: rows[0] });
};
