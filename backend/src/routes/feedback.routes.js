const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Submit feedback (requires authentication)
router.post('/submit', authMiddleware, feedbackController.submitFeedback);

// Get all feedback received by a user
router.get('/received/:userId', feedbackController.getFeedbackReceived);

// Get all feedback given by a user
router.get('/given/:userId', feedbackController.getFeedbackGiven);

// Get user's average rating
router.get('/rating/:userId', feedbackController.getUserAverageRating);

// Get feedback for a specific session
router.get('/session/:sessionId', feedbackController.getSessionFeedback);

// Delete feedback (requires authentication)
router.delete('/:feedbackId', authMiddleware, feedbackController.deleteFeedback);

module.exports = router;
