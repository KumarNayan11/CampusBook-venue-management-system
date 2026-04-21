const express = require('express');
const router = express.Router();
const { createTimetable, getTimetable } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'hod'), createTimetable);
router.get('/', getTimetable);

module.exports = router;
