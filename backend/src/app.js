const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const db = require('./models');
const { Op } = require('sequelize');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
});

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Make io globally accessible for controllers
app.locals.io = io;

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const skillRoutes = require('./routes/skill.routes');
const searchRoutes = require('./routes/search.routes');
const sessionRoutes = require('./routes/session.routes');
const quizRoutes = require('./routes/quiz.routes');
const meetingSessionRoutes = require('./routes/meetingSession.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const seedQuizData = require('../seed-quiz');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/meeting', meetingSessionRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
    res.send('SSEMS Backend is running');
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Cleanup job: Delete cancelled sessions older than 2 hours
const startCleanupJob = () => {
    // Run cleanup every 30 minutes
    const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
    const DELETION_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    const cleanupJob = setInterval(async () => {
        try {
            const Session = db.Session;
            const twoHoursAgo = new Date(Date.now() - DELETION_THRESHOLD);

            const deletedCount = await Session.destroy({
                where: {
                    status: 'Cancelled',
                    cancelledAt: {
                        [Op.lt]: twoHoursAgo
                    }
                }
            });

            if (deletedCount > 0) {
                console.log(`🗑️  Cleanup: Deleted ${deletedCount} old cancelled session(s)`);
            }
        } catch (error) {
            console.error('❌ Error in cleanup job:', error);
        }
    }, CLEANUP_INTERVAL);

    return cleanupJob;
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('Database connected!');
        // Skip auto-sync since we're using manual migrations
        // await sequelize.sync({ alter: false });
        console.log('Database ready!');

        // Seed quiz data
        await seedQuizData();

        // Start cleanup job for deleted sessions
        startCleanupJob();
        console.log('✅ Cleanup job started - will delete cancelled sessions older than 2 hours every 30 minutes');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
});
