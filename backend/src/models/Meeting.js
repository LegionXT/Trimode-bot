const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: "Meeting" },
  participants: { type: [String], default: [] }, // e.g. ["Raj"]
  date: { type: String },     // human-friendly: "2025-12-03"
  time: { type: String },     // human-friendly: "15:00"
  durationMinutes: { type: Number, default: 60 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Meeting", meetingSchema);
