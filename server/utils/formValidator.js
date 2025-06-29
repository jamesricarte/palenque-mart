exports.validate = (formData) => {
  if (
    Object.values(formData).includes("") |
    Object.values(formData).includes(null) |
    Object.values(formData).includes(undefined)
  ) {
    return {
      validation: false,
      message: "All fields required!",
      error: {
        code: "ALL_REQUIRED",
      },
    };
  } else {
    if ("email" in formData) {
      if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
      ) {
        return { validation: false, message: "Invalid email" };
      }
    }

    if ("mobileNumber" in formData) {
      const stringMobileNumber = String(formData.mobileNumber);

      if (/^(09|\+639)\d{9}$/.test(stringMobileNumber)) {
        const cleanedNumber = stringMobileNumber.replace(/[\s()-]/g, "");

        if (/^(09|\+639)\d{9}$/.test(cleanedNumber)) {
          return { validation: true };
        } else {
          return { validation: false, message: "Invalid mobile number" };
        }
      } else {
        return { validation: false, message: "Invalid mobile number" };
      }
    }

    if ("password" in formData) {
      const passwordRegex = /^.{6,}$/;

      if (!passwordRegex.test(formData.password)) {
        return {
          validation: false,
          message: "Minimum of 6 characters",
          error: {
            code: "PASSWORD_REQUIREMENT_NOT_MET",
          },
        };
      }
    }

    if ("confirmPassword" in formData) {
      if (formData.password !== formData.confirmPassword) {
        return {
          validation: false,
          message: "Your confirmation password did not match.",
          error: {
            code: "PASSWORD_CONFIRM_MISMATCH",
          },
        };
      }
    }

    return { validation: true };
  }
};
