const express = require('express');
const router = express.Router();
const { getOverallAnalytics, getDepartmentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/overall', protect, authorize('admin', 'dsw'), getOverallAnalytics);
router.get('/department', protect, authorize('hod', 'faculty'), getDepartmentAnalytics);

module.exports = router;
