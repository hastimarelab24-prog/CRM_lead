module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = req.user.role
      .toLowerCase()
      .trim();

    const permittedRoles = allowedRoles.map((role) =>
      role.toLowerCase().trim()
    );

    if (!permittedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};