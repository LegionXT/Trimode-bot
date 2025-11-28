const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const router = express.Router();

// ⚠️ TEMP ROUTE — remove after first use
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email & password required" });

  const existing = await Admin.findOne({ email });
  if (existing) return res.status(400).json({ message: "Admin already exists" });

  const hashed = await bcrypt.hash(password, 10);

  const admin = new Admin({
    email,
    password: hashed
  });

  await admin.save();

  return res.json({ message: "Admin created successfully" });
});

module.exports = router;
