// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// --------------------
// GENERAL AUTH (any logged-in user)
// --------------------
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Expect token in Authorization header: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    next(); // allow request to continue
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// --------------------
// ADMIN ONLY
// --------------------
exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  next();
};
