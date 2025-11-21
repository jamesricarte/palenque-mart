const getLocalIp = require("../../utils/getLocalIp");
require("dotenv").config();

module.exports = openAppVerify = async (req, res) => {
  const { token, email } = req.query;

  const appLink = `palenquemart://verify-email?token=${token}&email=${email}`;

  const fallback = `http://${getLocalIp()}:${
    process.env.PORT
  }/api/verify-email?token=${token}&email=${email}`;

  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0; url='${appLink}'" />
      </head>
      <body>
        <p>If the app does not open automatically, <a href="${fallback}">click here</a>.</p>
      </body>
    </html>
  `);
};
