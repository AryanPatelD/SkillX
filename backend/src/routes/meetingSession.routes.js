const express = require('express');
const router = express.Router();
const meetingSessionController = require('../controllers/meetingSession.controller');

// 1️⃣ Learner submits session with proposed slots
router.post('/sessions', meetingSessionController.createSession);

// 2️⃣ Tutor fetches pending sessions
router.get('/sessions', meetingSessionController.getPendingSessions);

// 3️⃣ Get all sessions (dashboard)
router.get('/sessions/all', meetingSessionController.getAllSessions);

// 4️⃣ Get specific session by ID
router.get('/sessions/:id', meetingSessionController.getSessionById);

// 5️⃣ Tutor confirms a slot (PUT old endpoint for backward compatibility)
router.put('/sessions/confirm', meetingSessionController.confirmSlot);

// 6️⃣ Tutor confirms slot for specific session (new endpoint)
router.put('/sessions/:id/confirm', meetingSessionController.confirmSlot);

// 7️⃣ Complete a session
router.put('/sessions/:id/complete', meetingSessionController.completeSession);

// 8️⃣ Cancel a session
router.delete('/sessions/:id', meetingSessionController.cancelSession);

module.exports = router;
