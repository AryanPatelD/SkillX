const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/request', authMiddleware, sessionController.createSessionRequest);
router.get('/incoming', authMiddleware, sessionController.getIncomingRequests);
router.get('/my-bookings', authMiddleware, sessionController.getMyBookings);
router.put('/:id/status', authMiddleware, sessionController.updateSessionStatus);

module.exports = router;
