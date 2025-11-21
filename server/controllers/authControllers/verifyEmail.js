const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = verifyEmail = async (req, res) => {
  let token = null;
  let email = null;
  let verificationIsFrom = "";

  if (req?.query?.token && req?.query?.email) {
    verificationIsFrom = "email";
    token = req.query.token;
    email = req.query.email;
  } else if (req?.body?.token && req?.body?.email) {
    verificationIsFrom = "deep-link";
    token = req.body.token;
    email = req.body.email;
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Token and email are required." });
  }

  let wss;

  if (verificationIsFrom === "email") {
    wss = req.app.get("wss");
    if (!wss) console.log("!WSS");
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    if (verificationIsFrom === "email") {
      if (wss) {
        wss.clients.forEach((socket) => {
          if (socket.readyState === 1) {
            socket.send(
              JSON.stringify({
                message: "Email Verified",
                email: email,
                success: true,
              })
            );

            console.log(
              `Email verified, sent websocket to all connected sockets with email: ${email}`
            );
          }
        });
      }

      return res.status(200).send("Email Verified!");
    } else {
      return res.status(200).json({
        success: true,
        message: "Email verified successfully!",
        data: {
          email,
        },
      });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError")
      console.error(
        "Verification Failed. User's verification token have already expired."
      );
    else console.error("Error verifying email:", error);

    if (verificationIsFrom === "email") {
      return res
        .status(500)
        .send(
          "Verification Failed. Your email is either invalid or your token have already expired."
        );
    } else {
      return res.status(500).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Verification Failed. Your email is either invalid or your token have already expired."
            : `Verification Failed: ${error}`,
      });
    }
  }
};
