const db = require('../models');
const Session = db.Session;
const User = db.User;
const Skill = db.Skill;

// Create a new session request
exports.createSessionRequest = async (req, res) => {
    try {
        const { providerId, skillId, scheduled_time, meeting_link } = req.body;
        const requesterId = req.user.id;

        // Validate provider exists
        const provider = await User.findByPk(providerId);
        if (!provider) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Check if requester has enough credits
        const requester = await User.findByPk(requesterId);
        if (requester.credits < 5) {
            return res.status(400).json({ message: 'Insufficient credits. You need at least 5 credits to book a session.' });
        }

        const session = await Session.create({
            requesterId,
            providerId,
            skillId,
            scheduled_time,
            status: 'Pending',
            meeting_link
        });

        res.status(201).json({ message: 'Session request sent successfully', session });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get sessions where the user is the provider (Incoming requests)
exports.getIncomingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await Session.findAll({
            where: { providerId: userId },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'username', 'full_name'] },
                { model: Skill, as: 'skill', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get sessions where the user is the requester (My bookings)
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await Session.findAll({
            where: { requesterId: userId },
            include: [
                { model: User, as: 'provider', attributes: ['id', 'username', 'full_name'] },
                { model: Skill, as: 'skill', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update session status (Accept, Reject, Complete, Cancel)
exports.updateSessionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const session = await Session.findByPk(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Ensure user is part of the session
        if (session.providerId !== userId && session.requesterId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Handle credit transfer when provider accepts (Confirmed)
        if (status === 'Confirmed' && session.providerId === userId && session.status === 'Pending') {
            // Get requester and provider
            const requester = await User.findByPk(session.requesterId);
            const provider = await User.findByPk(session.providerId);

            // Check if requester still has enough credits
            if (requester.credits < 5) {
                return res.status(400).json({ message: 'Requester does not have enough credits for this session.' });
            }

            // Deduct 5 credits from requester, add 5 to provider
            requester.credits -= 5;
            provider.credits += 5;

            await requester.save();
            await provider.save();
        }

        session.status = status;
        await session.save();

        res.json({ message: `Session ${status} successfully`, session });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
