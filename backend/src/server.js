require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/webhook", require("./routes/webhook"));

// AUTH middleware
const adminAuth = require("./middleware/adminAuth");

// Admin login route (NO protection)
app.use("/admin/auth", require("./routes/adminAuth"));

// PROTECTED ADMIN ROUTES
app.use("/admin/tickets", adminAuth, require("./routes/adminTickets"));
app.use("/admin/conversations", adminAuth, require("./routes/conversations"));
app.use("/admin/analytics", adminAuth, require("./routes/analytics"));


// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB error:", err));

// start server
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
