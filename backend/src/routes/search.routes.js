const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const optionalAuth = require('../middleware/optionalAuth.middleware');

// Public search (or protected, depends on requirements. currently public but optionally authenticated to filter self)
router.get('/skills', optionalAuth, searchController.searchOfferedSkills);
router.get('/requests', optionalAuth, searchController.searchRequests);

module.exports = router;
