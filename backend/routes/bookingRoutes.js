const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  hodApprove,
  dswApprove,
  rejectBooking,
  deleteBooking,
  withdrawBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('faculty', 'hod'), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/all', protect, getAllBookings);
router.put('/hod-approve/:id', protect, authorize('hod'), hodApprove);
router.put('/dsw-approve/:id', protect, authorize('dsw'), dswApprove);
router.put('/reject/:id', protect, authorize('dsw', 'hod'), rejectBooking);
router.patch('/:id/withdraw', protect, authorize('faculty', 'hod'), withdrawBooking);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

module.exports = router;

