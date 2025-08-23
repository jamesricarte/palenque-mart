const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = verifyEmail = async (req, res) => {
  const token = req.query.token;
  const email = req.query.email;

  const wss = req.app.get("wss");
  if (!wss) console.log("!WSS");

  try {
    jwt.verify(token, process.env.JWT_SECRET);

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

    return res.status(200).send("Email Verified!");
  } catch (error) {
    if (error.name === "TokenExpiredError")
      console.error(
        "Verification Failed. User's verification token have already expired."
      );
    else console.error(error);

    return res
      .status(500)
      .send(
        "Verification Failed. Your email is either invalid or your token have already expired."
      );
  }
};
