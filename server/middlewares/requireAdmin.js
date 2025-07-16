const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      success: false,
      error: { code: "UNAUTHORIZED" },
    })
  }

  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      message: "Admin access required",
      success: false,
      error: { code: "FORBIDDEN" },
    })
  }

  next()
}

module.exports = requireAdmin
