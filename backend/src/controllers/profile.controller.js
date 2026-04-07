const db = require('../models');
const User = db.User;
const Skill = db.Skill;
const Feedback = db.Feedback;
const sequelize = require('../config/database');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Skill,
                    as: 'offeredSkills',
                    through: { attributes: ['proficiency'] },
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get public profile with ratings
exports.getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Skill,
                    as: 'offeredSkills',
                    through: { attributes: ['proficiency'] },
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        try {
            // Get rating stats
            const ratingResult = await Feedback.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('*')), 'totalFeedbacks'],
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                ],
                where: { to_user_id: userId },
                raw: true,
            });

            const totalFeedbacks = parseInt(ratingResult[0]?.totalFeedbacks || 0);
            const averageRating = ratingResult[0]?.averageRating ? parseFloat(ratingResult[0].averageRating).toFixed(2) : 0;

            res.json({
                ...user.toJSON(),
                ratings: {
                    averageRating: parseFloat(averageRating),
                    totalFeedbacks: totalFeedbacks,
                },
            });
        } catch (feedbackError) {
            console.error('Error fetching feedback for profile:', feedbackError);
            // Return profile without ratings if there's an error fetching feedback
            res.json({
                ...user.toJSON(),
                ratings: {
                    averageRating: 0,
                    totalFeedbacks: 0,
                },
            });
        }
    } catch (error) {
        console.error('Error in getPublicProfile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { full_name, bio } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.full_name = full_name || user.full_name;
        user.bio = bio || user.bio;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                roll_no: user.roll_no,
                full_name: user.full_name,
                bio: user.bio,
                credits: user.credits,
            },
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
