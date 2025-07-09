const { optStore } = require("../utils/otpStore");

function sendOTP(mobileNumber) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  optStore.set(mobileNumber, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const storedOtp = optStore.get(mobileNumber);

  console.log(`OTP for ${mobileNumber} is: ${storedOtp.otp}`);
}

module.exports = sendOTP;
