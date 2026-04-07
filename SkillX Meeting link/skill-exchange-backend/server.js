const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE (FOR PROTOTYPE) ---
let sessions = [];
let nextId = 1;
// ------------------------------------------

// connect to MongoDB (Attempt)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.log("⚠️ MongoDB connection failed. Using in-memory storage for prototype.");
  });

const Session = require("./models/Session");

// 1️⃣ Learner creates session
app.post("/api/sessions", async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    // Fallback to in-memory
    const session = { ...req.body, _id: nextId++, status: "pending" };
    sessions.push(session);
    res.status(201).json(session);
  }
});

// 2️⃣ Tutor gets pending sessions
app.get("/api/sessions", async (req, res) => {
  try {
    const mongoSessions = await Session.find({ status: "pending" });
    res.json(mongoSessions);
  } catch (err) {
    // Fallback to in-memory
    res.json(sessions.filter(s => s.status === "pending"));
  }
});

// 3️⃣ Tutor confirms a slot
app.put("/api/sessions/:id/confirm", async (req, res) => {
  const selectedSlot = req.body.slot;
  const id = req.params.id;

  // dummy Google Meet link (prototype)
  const randomCode = Math.random().toString(36).substring(2, 5) + "-" +
    Math.random().toString(36).substring(2, 6) + "-" +
    Math.random().toString(36).substring(2, 5);
  const googleMeetLink = `https://meet.google.com/${randomCode}`;

  try {
    const session = await Session.findByIdAndUpdate(
      id,
      { status: "scheduled", confirmedSlot: selectedSlot, googleMeetLink },
      { new: true }
    );
    if (session) return res.json(session);
    throw new Error("Not found in Mongo");
  } catch (err) {
    // Fallback to in-memory
    const session = sessions.find(s => s._id == id);
    if (session) {
      session.status = "scheduled";
      session.confirmedSlot = selectedSlot;
      session.googleMeetLink = googleMeetLink;
      return res.json(session);
    }
    res.status(404).json({ message: "Session not found" });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
