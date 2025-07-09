exports.validate = (requestObject) => {
  if (
    Object.values(requestObject).includes("") |
    Object.values(requestObject).includes(null) |
    Object.values(requestObject).includes(undefined)
  ) {
    return {
      validation: false,
      message: "All fields required!",
      error: {
        code: "ALL_REQUIRED",
      },
    };
  } else {
    if ("email" in requestObject) {
      if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
          requestObject.email
        )
      ) {
        return { validation: false, message: "Invalid email" };
      }
    }

    if ("mobileNumber" in requestObject) {
      const stringMobileNumber = String(requestObject.mobileNumber);

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

    if ("password" in requestObject) {
      const passwordRegex = /^.{6,}$/;

      if (!passwordRegex.test(requestObject.password)) {
        return {
          validation: false,
          message: "Minimum of 6 characters",
          error: {
            code: "PASSWORD_REQUIREMENT_NOT_MET",
          },
        };
      }
    }

    if ("confirmPassword" in requestObject) {
      if (requestObject.password !== requestObject.confirmPassword) {
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
