const express = require('express');
const router = express.Router();
const {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getVenues);
router.post('/', protect, authorize('admin'), createVenue);
router.put('/:id', protect, authorize('admin'), updateVenue);
router.delete('/:id', protect, authorize('admin'), deleteVenue);

module.exports = router;
