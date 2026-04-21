const express = require('express');
const router = express.Router();
const { getOverallAnalytics, getDepartmentAnalytics, getPublicStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/overall', protect, authorize('admin', 'dsw'), getOverallAnalytics);
router.get('/department', protect, authorize('hod', 'faculty'), getDepartmentAnalytics);
router.get('/public', getPublicStats);

module.exports = router;
