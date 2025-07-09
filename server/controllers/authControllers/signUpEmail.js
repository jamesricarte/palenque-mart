const formValidator = require("../../utils/formValidator");
const sendVerificationEmail = require("../../utils/sendVerificationEmail");

exports.signUpEmail = async (req, res) => {
  const { email } = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res
      .status(400)
      .json({ message: formValidation.message, success: false });
  }

  try {
    await sendVerificationEmail(email, "new");

    return res.status(200).json({
      message:
        "A verification link was sent to your email. Please check your inbox to verify.",
      data: { email: email },
      success: true,
      signUpOption: "email",
    });
  } catch (error) {
    console.error("ERROR SENDING EMAIL", error);

    return res.status(500).json({
      message:
        "Failed to send the email. Please contact the server administrator for assistance.",
      success: false,
    });
  }

  // res.status(200).json({
  //   message:
  //     "A verification code was sent to your email. Please check your inbox to verify.",
  //   data: { email: email },
  //   success: true,
  //   signUpOption: "email",
  // });
};
