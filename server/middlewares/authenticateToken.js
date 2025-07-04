const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token is not present" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.statis(403).json({ message: "You are authenticated!" });

    req.userData = decoded;
    next();
  });
};

module.exports = authenticateToken;
