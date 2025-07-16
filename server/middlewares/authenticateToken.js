const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
      success: false,
      error: { code: "NO_TOKEN" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details including role
    const [users] = await db.execute(
      "SELECT id, role, is_active FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        message: "Invalid or inactive user",
        success: false,
        error: { code: "INVALID_USER" },
      });
    }

    req.user = {
      id: decoded.id,
      role: users[0].role,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid token",
      success: false,
      error: { code: "INVALID_TOKEN" },
    });
  }
};

module.exports = authenticateToken;
