
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token missing. Please login again.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is empty. Please login again.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      decoded.sub;

    const role = decoded.role;

    if (!userId || !role) {
      console.error("Invalid JWT payload keys:", Object.keys(decoded));

      return res.status(401).json({
        success: false,
        message: "Invalid token payload. Please login again.",
      });
    }

    req.user = {
      id: String(userId),
      _id: String(userId),
      role: String(role).trim().toLowerCase(),
    };

    return next();
  } catch (error) {
    console.error("Authentication middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};
