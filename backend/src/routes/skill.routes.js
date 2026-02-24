const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', skillController.getAllSkills);
router.post('/', authMiddleware, skillController.addSkill); // Optional: restrict to admin
router.post('/offer', authMiddleware, skillController.offerSkill);
router.post('/request', authMiddleware, skillController.requestSkill);
router.get('/my-skills', authMiddleware, skillController.getMySkills);
router.get('/my-requests', authMiddleware, skillController.getMyRequests);

module.exports = router;
