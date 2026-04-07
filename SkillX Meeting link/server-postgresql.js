const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// DATABASE CONFIGURATION
// ===============================
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  String(process.env.DB_NAME),
  String(process.env.DB_USER),
  String(process.env.DB_PASS),
  {
    host: String(process.env.DB_HOST),
    dialect: 'postgres',
    logging: false,
    port: process.env.DB_PORT || 5432,
  }
);

// ===============================
// MODELS
// ===============================
const { DataTypes } = require('sequelize');

const MeetingSession = sequelize.define(
  'MeetingSession',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    learner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tutor_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    learner_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    confirmed_slot: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    proposed_slots: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    meeting_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'MeetingSessions',
    timestamps: true,
  }
);

// ===============================
// HELPER FUNCTIONS
// ===============================
const generateMeetingLink = () => {
  const randomCode =
    Math.random().toString(36).substring(2, 5) +
    '-' +
    Math.random().toString(36).substring(2, 6) +
    '-' +
    Math.random().toString(36).substring(2, 5);
  return `https://meet.jit.si/SkillExchange-${randomCode}`;
};

// Health check
app.get('/test', (req, res) => {
  res.send('Meeting Link Backend is working');
});

// ===============================
// API ENDPOINTS
// ===============================

// 1️⃣ Learner submits slots
app.post('/api/sessions', async (req, res) => {
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
});

// 2️⃣ Tutor fetches pending sessions
app.get('/api/sessions', async (req, res) => {
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
});

// 3️⃣ Tutor confirms a slot
app.put('/api/sessions/confirm', async (req, res) => {
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
});

// Alternative endpoint for updating specific session
app.put('/api/sessions/:id/confirm', async (req, res) => {
  try {
    const { slot } = req.body;
    const { id } = req.params;

    if (!slot) {
      return res.status(400).json({ message: 'Slot is required' });
    }

    const session = await MeetingSession.findByPk(id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
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
});

// 4️⃣ Get session by ID
app.get('/api/sessions/:id', async (req, res) => {
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
});

// 5️⃣ Get all sessions
app.get('/api/sessions/all', async (req, res) => {
  try {
    const sessions = await MeetingSession.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
});

// ===============================
// SERVER STARTUP
// ===============================
const PORT = process.env.MEETING_PORT || 3001;

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ PostgreSQL database connected');
    console.log('📊 Using database:', process.env.DB_NAME);

    app.listen(PORT, () => {
      console.log(`\n🚀 Meeting Link Backend running on port ${PORT}`);
      console.log(`📍 Available at: http://localhost:${PORT}`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/test\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});
