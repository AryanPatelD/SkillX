const db = require('../models');
const Feedback = db.Feedback;
const User = db.User;
const MeetingSession = db.MeetingSession;
const sequelize = require('../config/database');

// Calculate credit points based on rating
const calculateCredits = (rating) => {
    switch (rating) {
        case 5:
            return 10; // Excellent
        case 4:
            return 5; // Very Good
        case 3:
            return 0; // Average
        case 2:
            return -3; // Below Average
        case 1:
            return -5; // Poor
        default:
            return 0;
    }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const { sessionId, toUserId, feedbackType, rating, comment, categories } = req.body;
        const fromUserId = req.user.id;

        // Validate input
        if (!toUserId || !feedbackType || !rating) {
            await transaction.rollback();
            return res.status(400).json({ message: 'toUserId, feedbackType, and rating are required' });
        }

        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (!['tutor_to_learner', 'learner_to_tutor'].includes(feedbackType)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Invalid feedback type' });
        }

        // Check if users exist
        const fromUser = await User.findByPk(fromUserId, { transaction });
        const toUser = await User.findByPk(toUserId, { transaction });

        if (!fromUser || !toUser) {
            await transaction.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // If sessionId is provided, verify it exists
        if (sessionId) {
            const session = await MeetingSession.findByPk(sessionId, { transaction });
            if (!session) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Session not found' });
            }
        }

        // Check if feedback already exists for this session
        const existingFeedback = await Feedback.findOne({
            where: {
                from_user_id: fromUserId,
                to_user_id: toUserId,
                session_id: sessionId || null,
            },
            transaction,
        });

        let feedback;
        let creditsChanged = 0;
        const previousRating = existingFeedback?.rating || null;

        if (existingFeedback) {
            // Update existing feedback
            // Calculate credit difference
            const oldCredits = calculateCredits(previousRating);
            const newCredits = calculateCredits(ratingNum);
            creditsChanged = newCredits - oldCredits;

            feedback = await existingFeedback.update(
                {
                    rating: ratingNum,
                    comment: comment || null,
                    categories: categories || {},
                    feedback_type: feedbackType,
                },
                { transaction }
            );
        } else {
            // Create new feedback
            creditsChanged = calculateCredits(ratingNum);

            feedback = await Feedback.create(
                {
                    session_id: sessionId || null,
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    feedback_type: feedbackType,
                    rating: ratingNum,
                    comment: comment || null,
                    categories: categories || {},
                },
                { transaction }
            );
        }

        // Update the recipient's credits using raw SQL for reliability
        if (creditsChanged !== 0) {
            await sequelize.query(
                `UPDATE "Users" SET credits = credits + :creditsChanged WHERE id = :userId`,
                {
                    replacements: { creditsChanged: creditsChanged, userId: toUserId },
                    transaction,
                    type: sequelize.QueryTypes.UPDATE,
                }
            );
        }

        await transaction.commit();

        // Fetch updated user with new credits
        const updatedToUser = await User.findByPk(toUserId);

        res.status(201).json({
            message: 'Feedback submitted successfully',
            data: feedback,
            credits: {
                changed: creditsChanged,
                ratingLabel:
                    ['Poor', 'Below Average', 'Average', 'Very Good', 'Excellent'][ratingNum - 1],
                recipientCredits: updatedToUser.credits,
                recipientName: updatedToUser.full_name,
            },
        });
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback', error: error.message });
    }
};

// Get all feedback received by a user
exports.getFeedbackReceived = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const feedbacks = await Feedback.findAndCountAll({
            where: { to_user_id: userId },
            include: [
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'full_name', 'email', 'bio'],
                },
                {
                    model: MeetingSession,
                    as: 'session',
                    attributes: ['id', 'confirmed_slot', 'meeting_link'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            total: feedbacks.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: feedbacks.rows,
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback', error: error.message });
    }
};

// Get feedback given by a user
exports.getFeedbackGiven = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const feedbacks = await Feedback.findAndCountAll({
            where: { from_user_id: userId },
            include: [
                {
                    model: User,
                    as: 'toUser',
                    attributes: ['id', 'full_name', 'email', 'bio'],
                },
                {
                    model: MeetingSession,
                    as: 'session',
                    attributes: ['id', 'confirmed_slot', 'meeting_link'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            total: feedbacks.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: feedbacks.rows,
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback', error: error.message });
    }
};

// Get user's average rating
exports.getUserAverageRating = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const result = await Feedback.findAll({
            attributes: [
                'feedback_type',
                [sequelize.fn('COUNT', sequelize.col('*')), 'count'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('MAX', sequelize.col('rating')), 'maxRating'],
                [sequelize.fn('MIN', sequelize.col('rating')), 'minRating'],
            ],
            where: { to_user_id: userId },
            group: ['feedback_type'],
            raw: true,
        });

        // Calculate overall average
        let overallAverage = 0;
        let totalCount = 0;

        if (result.length > 0) {
            let totalRating = 0;
            result.forEach((row) => {
                totalRating += parseFloat(row.averageRating) * parseInt(row.count);
                totalCount += parseInt(row.count);
            });
            overallAverage = totalCount > 0 ? (totalRating / totalCount).toFixed(2) : 0;
        }

        res.json({
            overallRating: parseFloat(overallAverage),
            totalFeedbacks: totalCount,
            byFeedbackType: result.map((r) => ({
                type: r.feedback_type,
                count: parseInt(r.count),
                averageRating: parseFloat(r.averageRating).toFixed(2),
                maxRating: parseInt(r.maxRating),
                minRating: parseInt(r.minRating),
            })),
        });
    } catch (error) {
        console.error('Error calculating average rating:', error);
        res.status(500).json({ message: 'Error calculating average rating', error: error.message });
    }
};

// Get feedback for a specific session
exports.getSessionFeedback = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Verify session exists
        const session = await MeetingSession.findByPk(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const feedbacks = await Feedback.findAll({
            where: { session_id: sessionId },
            include: [
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'full_name', 'email'],
                },
                {
                    model: User,
                    as: 'toUser',
                    attributes: ['id', 'full_name', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({
            sessionId,
            feedbacks,
        });
    } catch (error) {
        console.error('Error fetching session feedback:', error);
        res.status(500).json({ message: 'Error fetching session feedback', error: error.message });
    }
};

// Delete feedback (only by feedback giver or admin)
exports.deleteFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const userId = req.user.id;

        const feedback = await Feedback.findByPk(feedbackId);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Only allow deletion by the user who gave the feedback
        if (feedback.from_user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this feedback' });
        }

        await feedback.destroy();
        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Error deleting feedback', error: error.message });
    }
};
