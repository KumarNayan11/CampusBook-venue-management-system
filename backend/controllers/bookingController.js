const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const { checkConflicts } = require('../utils/conflictCheck');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('./notificationController');
const moment = require('moment');

exports.createBooking = asyncHandler(async (req, res) => {
  const { venueId, date, startTime, endTime, purpose } = req.body;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    res.status(404);
    throw new Error('Venue not found');
  }

  // C-07: Advance notice validation (dynamic from SystemConfig)
  let minAdvanceHours = 24; // default
  try {
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.findOne();
    if (config && config.min_advance_hours != null) {
      minAdvanceHours = config.min_advance_hours;
    }
  } catch (e) {
    // SystemConfig model may not exist during migration; use default
  }

  const bookingDateTime = moment(`${moment(date).format('YYYY-MM-DD')} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const hoursUntilBooking = bookingDateTime.diff(moment(), 'hours', true);
  if (hoursUntilBooking < minAdvanceHours) {
    res.status(400);
    throw new Error(`Bookings must be made at least ${minAdvanceHours} hours in advance.`);
  }

  // Venue booking hours validation
  if (venue.booking_open_time && venue.booking_close_time) {
    const bookingStart = moment(startTime, 'HH:mm');
    const bookingEnd = moment(endTime, 'HH:mm');
    const venueOpen = moment(venue.booking_open_time, 'HH:mm');
    const venueClose = moment(venue.booking_close_time, 'HH:mm');
    if (bookingStart.isBefore(venueOpen) || bookingEnd.isAfter(venueClose)) {
      res.status(400);
      throw new Error(`Booking time must be within venue hours: ${venue.booking_open_time} - ${venue.booking_close_time}`);
    }
  }

  const conflict = await checkConflicts(venueId, date, startTime, endTime);
  if (conflict.conflict) {
    res.status(400);
    throw new Error(conflict.reason);
  }

  let initialStatus = 'pending_dsw';
  if (venue.type === 'departmental') {
    initialStatus = 'pending_hod';
  }

  const booking = await Booking.create({
    userId: req.user._id,
    venueId,
    date,
    startTime,
    endTime,
    purpose,
    status: initialStatus,
  });

  // Notify Approvers
  if (venue.type === 'departmental') {
    const hods = await User.find({ role: 'hod', departmentId: venue.departmentId });
    for (const hod of hods) {
      await createNotification({
        recipient: hod._id,
        sender: req.user._id,
        type: 'booking_request',
        title: 'New Departmental Request',
        message: `${req.user.name} requested '${venue.name}' for ${new Date(date).toLocaleDateString()}.`,
        relatedId: booking._id
      });
    }
  } else {
    const dsws = await User.find({ role: 'dsw' });
    for (const dsw of dsws) {
      await createNotification({
        recipient: dsw._id,
        sender: req.user._id,
        type: 'booking_request',
        title: 'New Central Request',
        message: `${req.user.name} requested '${venue.name}' (Central) for ${new Date(date).toLocaleDateString()}.`,
        relatedId: booking._id
      });
    }
  }

  res.status(201).json(booking);
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).populate('venueId');
  res.json(bookings);
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const { departmentId, venueId, date, startDate, endDate } = req.query;
  const filter = {};
  
  if (departmentId) {
    // We need to find venues belonging to this department first
    const venues = await Venue.find({ departmentId });
    const venueIds = venues.map(v => v._id);
    filter.venueId = { $in: venueIds };
  }
  
  if (venueId) filter.venueId = venueId;

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23,59,59,999);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  } else if (startDate && endDate) {
    const sDate = new Date(startDate);
    sDate.setUTCHours(0,0,0,0);
    const eDate = new Date(endDate);
    eDate.setUTCHours(23,59,59,999);
    filter.date = { $gte: sDate, $lte: eDate };
  }

  const bookings = await Booking.find(filter)
    .populate({
      path: 'venueId',
      populate: { path: 'departmentId' }
    })
    .populate('userId');
  res.json(bookings);
});

exports.hodApprove = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.venueId.type !== 'departmental') {
    res.status(400);
    throw new Error('Only departmental venues require HOD approval');
  }

  booking.approvedByHod = true;
  booking.status = 'pending_dsw';
  await booking.save();

  // Notify DSW
  const dsws = await User.find({ role: 'dsw' });
  for (const dsw of dsws) {
    await createNotification({
      recipient: dsw._id,
      sender: req.user._id,
      type: 'booking_request',
      title: 'HOD Approved Request',
      message: `HOD Approved '${booking.venueId.name}' for ${new Date(booking.date).toLocaleDateString()}. Pending your final oversight.`,
      relatedId: booking._id
    });
  }

  // Notify Faculty
  await createNotification({
    recipient: booking.userId,
    sender: req.user._id,
    type: 'booking_approved',
    title: 'HOD Approval Granted',
    message: `Your request for '${booking.venueId.name}' has been approved by HOD and forwarded to DSW.`,
    relatedId: booking._id
  });

  res.json({ message: 'Approved by HOD, forwarded to DSW', booking });
});

exports.dswApprove = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.venueId.type === 'departmental' && !booking.approvedByHod) {
    res.status(400);
    throw new Error('Need HOD approval first for departmental venues');
  }

  booking.approvedByDsw = true;
  booking.status = 'approved';
  await booking.save();

  // Notify Faculty
  await createNotification({
    recipient: booking.userId,
    sender: req.user._id,
    type: 'booking_approved',
    title: 'Final Approval Received',
    message: `CONGRATULATIONS! Your request for '${booking.venueId.name}' has been FINALLY APPROVED by DSW.`,
    relatedId: booking._id
  });

  res.json({ message: 'Approved by DSW', booking });
});

exports.rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = 'rejected';
  await booking.save();

  // Notify Faculty
  await createNotification({
    recipient: booking.userId,
    sender: req.user._id,
    type: 'booking_rejected',
    title: 'Reservation Denied',
    message: `Your request for '${booking.venueId?.name || 'Venue'}' has been REJECTED by ${req.user.role.toUpperCase()}.`,
    relatedId: booking._id
  });

  res.json({ message: 'Booking rejected', booking });
});

// C-04: DELETE restricted to admin only (Option A)
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking record not found');
  }

  // Only admin can hard-delete (C-04 Option A)
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only administrators can delete booking records. Use withdraw to cancel.');
  }

  await Booking.findByIdAndDelete(req.params.id);
  res.json({ message: 'Booking record purged successfully' });
});

// C-05: Withdraw handler — soft-cancellation by requester
exports.withdrawBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // 1. Ownership check — only the requester can withdraw
  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the booking requester can withdraw this booking.');
  }

  // 2. Terminal status guard — cannot withdraw if already withdrawn or rejected
  if (['withdrawn', 'rejected'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Cannot withdraw a booking with status '${booking.status}'.`);
  }

  // 3. Pre-event datetime check — cannot withdraw after event has started
  const bookingDateTime = moment(
    `${moment(booking.date).format('YYYY-MM-DD')} ${booking.startTime}`,
    'YYYY-MM-DD HH:mm'
  );
  if (moment().isSameOrAfter(bookingDateTime)) {
    res.status(400);
    throw new Error('Cannot withdraw a booking after the event has started.');
  }

  // 4. Set terminal status
  booking.status = 'withdrawn';
  await booking.save();

  // 5. Notify relevant approvers
  const venue = booking.venueId;
  if (venue && venue.type === 'departmental') {
    const hods = await User.find({ role: 'hod', departmentId: venue.departmentId });
    for (const hod of hods) {
      await createNotification({
        recipient: hod._id,
        sender: req.user._id,
        type: 'booking_withdrawn',
        title: 'Booking Withdrawn',
        message: `${req.user.name} withdrew their booking for '${venue.name}' on ${moment(booking.date).format('DD/MM/YYYY')}.`,
        relatedId: booking._id
      });
    }
  }
  const dsws = await User.find({ role: 'dsw' });
  for (const dsw of dsws) {
    await createNotification({
      recipient: dsw._id,
      sender: req.user._id,
      type: 'booking_withdrawn',
      title: 'Booking Withdrawn',
      message: `${req.user.name} withdrew their booking for '${venue?.name || 'a venue'}' on ${moment(booking.date).format('DD/MM/YYYY')}.`,
      relatedId: booking._id
    });
  }

  res.json({ message: 'Booking withdrawn successfully', booking });
});
