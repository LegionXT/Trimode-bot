const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  remindAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  sent: { type: Boolean, default: false }
});

module.exports = mongoose.model("Reminder", reminderSchema);
