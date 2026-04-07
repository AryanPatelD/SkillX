const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all quiz categories
router.get('/categories', authMiddleware, quizController.getCategories);

// Get quiz status for user
router.get('/status', authMiddleware, quizController.getQuizStatus);

// Get quiz questions for a category
router.get('/:categoryId/questions', authMiddleware, quizController.getQuizQuestions);

// Submit quiz answers
router.post('/submit', authMiddleware, quizController.submitQuiz);

// Get user's last quiz attempt
router.get('/attempt/last', authMiddleware, quizController.getLastAttempt);

module.exports = router;
