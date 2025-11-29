// backend/src/scripts/createAdmin.js
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env")
});
const mongoose = require("mongoose");
const User = require("../models/User");

// 1) Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB error:", err));

const createAdmin = async () => {
  try {
    const email = "admin@example.com"; // CHANGE if you want
    const password = "StrongP@ssw0rd"; // CHANGE after creation
    const name = "Admin";

    // Check if admin exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin
    const admin = new User({
      name,
      email,
      password,
      role: "admin"
    });

    await admin.save();
    console.log("Admin created SUCCESSFULLY:", admin.email);
    process.exit(0);

  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();
