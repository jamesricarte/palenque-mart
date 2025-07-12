const db = require("../../config/db");

const formValidator = require("../../utils/formValidator");
const sendVerificationEmail = require("../../utils/sendVerificationEmail");

module.exports = sendEmail = async (req, res) => {
  const { email, editing } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  if (editing) {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (rows.length > 0) {
        return res
          .status(400)
          .json({ message: "This email was already used.", success: false });
      }
    } catch (error) {
      console.error(error);
      return res.status(200).json({ message: "Something went wrong" });
    }
  }

  try {
    await sendVerificationEmail(email);

    return res.status(200).json({
      message:
        "We sent a verification link to your email. Please check your inbox to verify.",
      success: true,
      data: { email: email },
    });
  } catch (error) {
    console.error("ERROR SENDING EMAIL", error);

    return res.status(500).json({
      message:
        "Failed to send the email. Please contact the server administrator for assistance.",
      success: false,
    });
  }
};
