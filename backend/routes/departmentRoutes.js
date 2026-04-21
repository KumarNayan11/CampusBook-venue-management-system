const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDepartments);
router.post('/', protect, authorize('admin'), createDepartment);

module.exports = router;
