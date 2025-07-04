const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyEmail = async (req, res) => {
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
      }
    });

    return res.status(200).send("Email Verified!");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(
        "Verification Failed. Your email is either invalid or your token have already expired."
      );
  }
};
