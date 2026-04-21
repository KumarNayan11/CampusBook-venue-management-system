const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect, authorize } = require('../middleware/authMiddleware');

// C-07: System config endpoints (PRD §5.11, §7)
router.get('/', protect, authorize('admin'), getConfig);
router.put('/', protect, authorize('admin'), updateConfig);

module.exports = router;
