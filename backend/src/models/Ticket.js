const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  userId: String,
  issue: String,
  status: { type: String, default: "open" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ticket", ticketSchema);
