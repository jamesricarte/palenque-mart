const formValidator = require("../../utils/formValidator");
const sendVerificationEmail = require("../../utils/sendVerificationEmail");

module.exports = sendEmail = async (req, res) => {
  const { email } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  try {
    await sendVerificationEmail(email);

    return res.status(200).json({
      message:
        "We sent a verification link to your email. Please check your inbox to verify.",
      success: true,
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
