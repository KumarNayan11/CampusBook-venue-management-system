const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const Department = require('../models/Department');
const { checkConflicts } = require('../utils/conflictCheck');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('./notificationController');
const moment = require('moment');

// ─── Helper: resolve HOD for a department venue ──────────────────────────────
// HOD is determined via the Department.hodId field, NOT User.departmentId.
// This ensures the correct HOD is always notified regardless of whether
// a faculty member's departmentId matches the venue's department.
async function getDeptHod(departmentId) {
  if (!departmentId) return null;
  const dept = await Department.findById(departmentId).populate('hodId');
  return dept?.hodId || null;
}

// ─── Create Booking ───────────────────────────────────────────────────────────
exports.createBooking = asyncHandler(async (req, res) => {
  const { venueId, date, startTime, endTime, purpose } = req.body;

  const venue = await Venue.findById(venueId).populate('departmentId');
  if (!venue) {
    res.status(404);
    throw new Error('Venue not found');
  }

  // C-07: Advance notice validation (dynamic from SystemConfig)
  let minAdvanceHours = 24;
  try {
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.findOne();
    if (config && config.min_advance_hours != null) {
      minAdvanceHours = config.min_advance_hours;
    }
  } catch (e) { /* use default */ }

  const bookingDateTime = moment(`${moment(date).format('YYYY-MM-DD')} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const hoursUntilBooking = bookingDateTime.diff(moment(), 'hours', true);
  if (hoursUntilBooking < minAdvanceHours) {
    res.status(400);
    throw new Error(`Bookings must be made at least ${minAdvanceHours} hours in advance.`);
  }

  // Venue booking hours validation
  if (venue.booking_open_time && venue.booking_close_time) {
    const bookingStart = moment(startTime, 'HH:mm');
    const bookingEnd   = moment(endTime, 'HH:mm');
    const venueOpen    = moment(venue.booking_open_time, 'HH:mm');
    const venueClose   = moment(venue.booking_close_time, 'HH:mm');
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

  // Determine initial status:
  // departmental venues → pending_hod first
  // central venues      → skip HOD, go straight to pending_dsw
  const isDepartmental = venue.type === 'departmental';
  const initialStatus  = isDepartmental ? 'pending_hod' : 'pending_dsw';

  // Build snapshot at creation time so logs survive entity deletion
  const snapshot = {
    userName:       req.user.name,
    userEmail:      req.user.email,
    venueName:      venue.name,
    venueType:      venue.type,
    departmentName: venue.departmentId?.name || '',
    departmentId:   venue.departmentId?._id || venue.departmentId || null,
  };

  const booking = await Booking.create({
    userId: req.user._id,
    venueId,
    date,
    startTime,
    endTime,
    purpose,
    status: initialStatus,
    snapshot,
  });

  // Notify the correct approver(s)
  if (isDepartmental) {
    // Find HOD via Department.hodId — NOT via User.departmentId
    const hod = await getDeptHod(venue.departmentId?._id || venue.departmentId);
    if (hod) {
      await createNotification({
        recipient: hod._id,
        sender: req.user._id,
        type: 'booking_request',
        title: 'New Departmental Request',
        message: `${req.user.name} requested '${venue.name}' for ${new Date(date).toLocaleDateString()}.`,
        relatedId: booking._id,
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
        relatedId: booking._id,
      });
    }
  }

  res.status(201).json(booking);
});

// ─── My Bookings ──────────────────────────────────────────────────────────────
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('venueId')
    .populate('userId', 'name email')
    .sort({ date: -1, createdAt: -1 });
  res.json(bookings);
});

// ─── Get All Bookings (admin/dsw/hod) ────────────────────────────────────────
exports.getAllBookings = asyncHandler(async (req, res) => {
  const { departmentId, venueId, date, startDate, endDate } = req.query;
  const filter = {};

  if (departmentId) {
    const venues = await Venue.find({ departmentId });
    const venueIds = venues.map(v => v._id);
    filter.venueId = { $in: venueIds };
  }

  if (venueId) filter.venueId = venueId;

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  } else if (startDate && endDate) {
    const sDate = new Date(startDate);
    sDate.setUTCHours(0, 0, 0, 0);
    const eDate = new Date(endDate);
    eDate.setUTCHours(23, 59, 59, 999);
    filter.date = { $gte: sDate, $lte: eDate };
  }

  const bookings = await Booking.find(filter)
    .populate({ path: 'venueId', populate: { path: 'departmentId' } })
    .populate('userId', 'name email role');

  res.json(bookings);
});

// ─── HOD Approval ─────────────────────────────────────────────────────────────
// HOD can only approve bookings for venues belonging to their own department.
exports.hodApprove = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (!booking.venueId || booking.venueId.type !== 'departmental') {
    res.status(400);
    throw new Error('Only departmental venues require HOD approval');
  }

  if (booking.status !== 'pending_hod') {
    res.status(400);
    throw new Error('This booking is not awaiting HOD approval');
  }

  // Verify the acting HOD is responsible for this venue's department
  const dept = await Department.findById(booking.venueId.departmentId);
  if (!dept || !dept.hodId || dept.hodId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not the HOD of the department that owns this venue');
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
      title: 'HOD Approved — Awaiting DSW',
      message: `HOD approved '${booking.venueId.name}' for ${new Date(booking.date).toLocaleDateString()}. Pending your final oversight.`,
      relatedId: booking._id,
    });
  }

  // Notify requester
  await createNotification({
    recipient: booking.userId,
    sender: req.user._id,
    type: 'booking_approved',
    title: 'HOD Approval Granted',
    message: `Your request for '${booking.venueId.name}' has been approved by HOD and forwarded to DSW.`,
    relatedId: booking._id,
  });

  res.json({ message: 'Approved by HOD, forwarded to DSW', booking });
});

// ─── DSW Approval ─────────────────────────────────────────────────────────────
exports.dswApprove = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.status !== 'pending_dsw') {
    res.status(400);
    throw new Error('This booking is not awaiting DSW approval');
  }

  // Guard: departmental venues must have HOD approval first
  if (booking.venueId && booking.venueId.type === 'departmental' && !booking.approvedByHod) {
    res.status(400);
    throw new Error('HOD must approve departmental venue bookings before DSW');
  }

  booking.approvedByDsw = true;
  booking.status = 'approved';
  await booking.save();

  await createNotification({
    recipient: booking.userId,
    sender: req.user._id,
    type: 'booking_approved',
    title: 'Final Approval Received',
    message: `Congratulations! Your request for '${booking.venueId?.name || booking.snapshot.venueName}' has been approved by DSW.`,
    relatedId: booking._id,
  });

  res.json({ message: 'Approved by DSW', booking });
});

// ─── Reject Booking ───────────────────────────────────────────────────────────
exports.rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = 'rejected';
  await booking.save();

  await createNotification({
    recipient: booking.userId,
    sender: req.user._id,
    type: 'booking_rejected',
    title: 'Reservation Denied',
    message: `Your request for '${booking.venueId?.name || booking.snapshot.venueName}' has been rejected by ${req.user.role.toUpperCase()}.`,
    relatedId: booking._id,
  });

  res.json({ message: 'Booking rejected', booking });
});

// ─── Delete Booking (Admin only) ──────────────────────────────────────────────
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking record not found');
  }

  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only administrators can delete booking records. Use withdraw to cancel.');
  }

  await Booking.findByIdAndDelete(req.params.id);
  res.json({ message: 'Booking record purged successfully' });
});

// ─── Withdraw Booking ─────────────────────────────────────────────────────────
exports.withdrawBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('venueId');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the booking requester can withdraw this booking.');
  }

  if (['withdrawn', 'rejected'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Cannot withdraw a booking with status '${booking.status}'.`);
  }

  const bookingDateTime = moment(
    `${moment(booking.date).format('YYYY-MM-DD')} ${booking.startTime}`,
    'YYYY-MM-DD HH:mm'
  );
  if (moment().isSameOrAfter(bookingDateTime)) {
    res.status(400);
    throw new Error('Cannot withdraw a booking after the event has started.');
  }

  booking.status = 'withdrawn';
  await booking.save();

  const venueName = booking.venueId?.name || booking.snapshot.venueName || 'the venue';
  const dateStr = moment(booking.date).format('DD/MM/YYYY');

  // Notify the relevant HOD (if departmental and still pending_hod)
  const venueDoc = booking.venueId;
  if (venueDoc && venueDoc.type === 'departmental') {
    const hod = await getDeptHod(venueDoc.departmentId);
    if (hod) {
      await createNotification({
        recipient: hod._id,
        sender: req.user._id,
        type: 'booking_withdrawn',
        title: 'Booking Withdrawn',
        message: `${req.user.name} withdrew their booking for '${venueName}' on ${dateStr}.`,
        relatedId: booking._id,
      });
    }
  }

  // Notify DSW
  const dsws = await User.find({ role: 'dsw' });
  for (const dsw of dsws) {
    await createNotification({
      recipient: dsw._id,
      sender: req.user._id,
      type: 'booking_withdrawn',
      title: 'Booking Withdrawn',
      message: `${req.user.name} withdrew their booking for '${venueName}' on ${dateStr}.`,
      relatedId: booking._id,
    });
  }

  res.json({ message: 'Booking withdrawn successfully', booking });
});
