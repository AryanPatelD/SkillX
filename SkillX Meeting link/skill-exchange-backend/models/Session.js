const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: String,
  startTime: String,
  endTime: String
});

const sessionSchema = new mongoose.Schema({
  status: { type: String, default: "pending" },
  learnerName: String,
  proposedSlots: [slotSchema],
  confirmedSlot: slotSchema,
  googleMeetLink: String
});

module.exports = mongoose.model("Session", sessionSchema);
