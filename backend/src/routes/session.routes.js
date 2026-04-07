const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, sessionController.offerHelp);
router.get('/incoming', authMiddleware, sessionController.getIncomingRequests);
router.get('/pending-offers', authMiddleware, sessionController.getPendingOffers);
router.get('/meetings/active', authMiddleware, sessionController.getUserMeetings);
router.put('/:id/status', authMiddleware, sessionController.updateSessionStatus);
router.put('/:id/confirm', authMiddleware, sessionController.confirmSessionTime);
router.put('/:meetingId/complete', authMiddleware, sessionController.completeMeeting);

module.exports = router;
