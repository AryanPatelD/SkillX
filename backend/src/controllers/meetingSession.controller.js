const db = require('../models');
const MeetingSession = db.MeetingSession;

// Generate random meeting link code
const generateMeetingLink = () => {
  const randomCode =
    Math.random().toString(36).substring(2, 5) +
    '-' +
    Math.random().toString(36).substring(2, 6) +
    '-' +
    Math.random().toString(36).substring(2, 5);
  return `https://meet.jit.si/SkillExchange-${randomCode}`;
};

// 1️⃣ Learner submits slots
exports.createSession = async (req, res) => {
  try {
    const { learnerName, slots } = req.body;

    if (!learnerName || !slots || slots.length === 0) {
      return res.status(400).json({
        message: 'Learner name and at least one slot are required',
      });
    }

    const session = await MeetingSession.create({
      learner_name: learnerName,
      proposed_slots: slots,
      status: 'pending',
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
};

// 2️⃣ Tutor fetches pending sessions
exports.getPendingSessions = async (req, res) => {
  try {
    const sessions = await MeetingSession.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
    });

    // Return first pending session or null
    const session = sessions.length > 0 ? sessions[0] : null;
    res.json(session);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

// 3️⃣ Tutor confirms a slot
exports.confirmSlot = async (req, res) => {
  try {
    const { slot, sessionId } = req.body;

    if (!slot) {
      return res.status(400).json({ message: 'Slot is required' });
    }

    let session;

    // If sessionId provided, update specific session
    if (sessionId) {
      session = await MeetingSession.findByPk(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
    } else {
      // Otherwise update first pending session
      session = await MeetingSession.findOne({
        where: { status: 'pending' },
      });

      if (!session) {
        return res.status(404).json({ message: 'No pending session found' });
      }
    }

    const meetingLink = generateMeetingLink();

    await session.update({
      status: 'scheduled',
      confirmed_slot: slot,
      meeting_link: meetingLink,
      updatedAt: new Date(),
    });

    res.json(session);
  } catch (error) {
    console.error('Error confirming slot:', error);
    res.status(500).json({ message: 'Error confirming slot', error: error.message });
  }
};

// 4️⃣ Get session by ID (for status checking)
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await MeetingSession.findByPk(id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

// 5️⃣ Get all sessions (admin/tutor dashboard)
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await MeetingSession.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

// 6️⃣ Complete a session
exports.completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await MeetingSession.findByPk(id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.update({
      status: 'completed',
      updatedAt: new Date(),
    });

    res.json(session);
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ message: 'Error completing session', error: error.message });
  }
};

// 7️⃣ Cancel a session
exports.cancelSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await MeetingSession.findByPk(id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.update({
      status: 'cancelled',
      updatedAt: new Date(),
    });

    res.json(session);
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ message: 'Error cancelling session', error: error.message });
  }
};
