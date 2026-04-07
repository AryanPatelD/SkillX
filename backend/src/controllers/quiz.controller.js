const db = require('../models');
const { Op } = require('sequelize');

const Quiz = db.QuizCategory;
const Question = db.QuizQuestion;
const Attempt = db.QuizAttempt;
const User = db.User;

// Get all quiz categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Quiz.findAll({
            attributes: ['id', 'name', 'description'],
            order: [['name', 'ASC']],
        });
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Error fetching quiz categories' });
    }
};

// Get quiz questions for a category
exports.getQuizQuestions = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const userId = req.user.id;

        // Check if user has 0 credits
        const user = await User.findByPk(userId);
        if (user.credits !== 0) {
            return res.status(403).json({ message: 'You must have 0 credits to take the quiz' });
        }

        // Check if user is in cooldown from a failed attempt
        if (user.quiz_cooldown_until && new Date(user.quiz_cooldown_until) > new Date()) {
            return res.status(403).json({
                message: 'You must wait before retaking the quiz',
                cooldownUntil: user.quiz_cooldown_until,
            });
        }

        // Get questions (5 easy, 4 medium, 1 hard)
        const easyQuestions = await Question.findAll({
            where: {
                categoryId,
                difficulty_level: 'Easy',
            },
            order: db.sequelize.random(),
            limit: 5,
            attributes: { exclude: ['correct_answer', 'updatedAt'] },
        });

        const mediumQuestions = await Question.findAll({
            where: {
                categoryId,
                difficulty_level: 'Medium',
            },
            order: db.sequelize.random(),
            limit: 4,
            attributes: { exclude: ['correct_answer', 'updatedAt'] },
        });

        const hardQuestions = await Question.findAll({
            where: {
                categoryId,
                difficulty_level: 'Hard',
            },
            order: db.sequelize.random(),
            limit: 1,
            attributes: { exclude: ['correct_answer', 'updatedAt'] },
        });

        const questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

        // Shuffle questions
        const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

        res.json({
            categoryId,
            totalQuestions: shuffledQuestions.length,
            questions: shuffledQuestions,
        });
    } catch (err) {
        console.error('Error fetching quiz questions:', err);
        res.status(500).json({ message: 'Error fetching quiz questions' });
    }
};

// Submit quiz answers and calculate score
exports.submitQuiz = async (req, res) => {
    try {
        const { categoryId, answers } = req.body;
        const userId = req.user.id;

        // Validate inputs
        if (!categoryId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid quiz submission' });
        }

        // Check user credits
        const user = await User.findByPk(userId);
        if (user.credits !== 0) {
            return res.status(403).json({ message: 'You must have 0 credits to take the quiz' });
        }

        // Get all questions from database for answer verification
        const dbQuestions = await Question.findAll({
            where: { categoryId },
            attributes: ['id', 'correct_answer'],
        });

        // Create a map of question IDs to correct answers
        const correctAnswersMap = {};
        dbQuestions.forEach(q => {
            correctAnswersMap[q.id] = q.correct_answer;
        });

        // Calculate score
        let score = 0;
        answers.forEach(({ questionId, answer }) => {
            if (correctAnswersMap[questionId] === answer) {
                score++;
            }
        });

        const totalQuestions = 10;
        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= 60;

        // Create quiz attempt record
        const attempt = await Attempt.create({
            userId,
            categoryId,
            score,
            total_questions: totalQuestions,
            percentage: parseFloat(percentage.toFixed(2)),
            passed,
            attempted_at: new Date(),
            next_attempt_allowed_at: !passed ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        });

        // Update user credits if passed (60% or more)
        if (passed) {
            await user.update({
                credits: user.credits + 10,
                last_quiz_attempt_at: new Date(),
                quiz_cooldown_until: null,
            });
        } else {
            // Set 7-day cooldown if failed
            await user.update({
                last_quiz_attempt_at: new Date(),
                quiz_cooldown_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
        }

        res.json({
            passed,
            score,
            totalQuestions,
            percentage: parseFloat(percentage.toFixed(2)),
            creditsEarned: passed ? 10 : 0,
            message: passed
                ? '🎉 Congratulations! You passed the quiz and earned 10 credits!'
                : '❌ You need 60% to pass. Try again in 7 days!',
            nextAttemptAllowedAt: attempt.next_attempt_allowed_at,
        });
    } catch (err) {
        console.error('Error submitting quiz:', err);
        res.status(500).json({ message: 'Error submitting quiz' });
    }
};

// Get user's last quiz attempt
exports.getLastAttempt = async (req, res) => {
    try {
        const userId = req.user.id;

        const lastAttempt = await Attempt.findOne({
            where: { userId },
            order: [['attempted_at', 'DESC']],
            include: [
                {
                    model: Quiz,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });

        res.json(lastAttempt || {});
    } catch (err) {
        console.error('Error fetching last attempt:', err);
        res.status(500).json({ message: 'Error fetching quiz attempt' });
    }
};

// Get user's quiz eligibility and status
exports.getQuizStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['credits', 'quiz_cooldown_until', 'last_quiz_attempt_at'],
        });

        const isEligible = user.credits === 0;
        const isCooldownActive = user.quiz_cooldown_until && new Date(user.quiz_cooldown_until) > new Date();

        res.json({
            credits: user.credits,
            isEligible,
            isCooldownActive,
            cooldownUntil: user.quiz_cooldown_until,
        });
    } catch (err) {
        console.error('Error fetching quiz status:', err);
        res.status(500).json({ message: 'Error fetching quiz status' });
    }
};
