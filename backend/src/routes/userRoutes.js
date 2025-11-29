console.log("userRoutes loaded");

// backend/src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Protected: get logged-in user info
router.get("/profile", protect, (req, res) => {
  return res.json({
    message: "User profile fetched successfully",
    user: req.user
  });
});

// Protected: example user dashboard data
router.get("/dashboard", protect, (req, res) => {
  return res.json({
    message: "Welcome to your dashboard",
    userId: req.user._id,
    email: req.user.email
  });
});

module.exports = router;
