const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// IN-MEMORY SESSION (PROTOTYPE)
// ===============================
let session = null;

// Health check (optional but useful)
app.get("/test", (req, res) => {
  res.send("Backend is working");
});

// 1️⃣ Learner submits slots
app.post("/api/sessions", (req, res) => {
  session = {
    learnerName: req.body.learnerName,
    slots: req.body.slots,
    status: "pending"
  };
  res.json(session);
});

// 2️⃣ Tutor fetches session
app.get("/api/sessions", (req, res) => {
  res.json(session);
});

// 3️⃣ Tutor confirms slot
app.put("/api/sessions/confirm", (req, res) => {
  if (!session) {
    return res.status(400).json({ message: "No session found" });
  }

  const randomCode =
    Math.random().toString(36).substring(2, 5) + "-" +
    Math.random().toString(36).substring(2, 6) + "-" +
    Math.random().toString(36).substring(2, 5);

  session.confirmedSlot = req.body.slot;
 session.meetLink = `https://meet.jit.si/SkillExchange-${randomCode}`;

  session.status = "scheduled";

  res.json(session);
});

// START SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
