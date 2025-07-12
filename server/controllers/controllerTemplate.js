const db = require("../../config/db");
const formValidator = require("../../utils/formValidator");

module.exports = controllerName = async (req, res) => {
  const {} = req.body;

  const formValidation = formValidator.validate(req.body);

  if (!formValidation.validation) {
    return res.status(400).json({
      message: formValidation.message,
      success: false,
    });
  }
};
