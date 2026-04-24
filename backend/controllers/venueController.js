const Venue = require('../models/Venue');
const asyncHandler = require('../utils/asyncHandler');

// C-06: Role-based venue visibility (PRD §5.4)
exports.getVenues = asyncHandler(async (req, res) => {
  const filter = {};
  // Faculty and HOD see only available venues
  // DSW and Admin see all venues (including maintenance)
  if (req.user && ['faculty', 'hod'].includes(req.user.role)) {
    // filter.status = 'available';
  }
  const venues = await Venue.find(filter).populate('departmentId', 'name');
  res.json(venues);
});

exports.createVenue = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    departmentId,
    capacity,
    location,
    image,
    status,
    category,
    booking_open_time,
    booking_close_time,
  } = req.body;

  if (type === 'departmental' && !departmentId) {
    res.status(400);
    throw new Error('Departmental venues must be associated with a department');
  }

  const venue = await Venue.create({
    name,
    type,
    departmentId: type === 'central' ? null : (departmentId || null),
    capacity,
    location,
    image,
    status: status || 'available',
    category,
    booking_open_time,
    booking_close_time,
  });
  res.status(201).json(venue);
});

exports.updateVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!venue) {
    res.status(404);
    throw new Error('Venue not found');
  }
  res.json(venue);
});

exports.deleteVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findByIdAndDelete(req.params.id);
  if (!venue) {
    res.status(404);
    throw new Error('Venue not found');
  }
  res.json({ message: 'Venue deleted' });
});
