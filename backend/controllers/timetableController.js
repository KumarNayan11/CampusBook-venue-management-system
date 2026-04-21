const Timetable = require('../models/Timetable');
const { isOverlapping } = require('../utils/conflictCheck');
const asyncHandler = require('../utils/asyncHandler');

exports.createTimetable = asyncHandler(async (req, res) => {
  const { venueId, day, startTime, endTime, subject } = req.body;

  // Check for existing timetable clashes in the same room on the same day
  const existingSchedules = await Timetable.find({ venueId, day: { $regex: new RegExp(`^${day}$`, 'i') } });
  
  for (const schedule of existingSchedules) {
    if (isOverlapping(startTime, endTime, schedule.startTime, schedule.endTime)) {
      res.status(400);
      throw new Error(`Timetable conflict detected: '${subject}' clashes with existing subject '${schedule.subject}' (${schedule.startTime} - ${schedule.endTime}).`);
    }
  }

  const timetable = await Timetable.create(req.body);
  res.status(201).json(timetable);
});

exports.getTimetable = asyncHandler(async (req, res) => {
  const { venueId } = req.query;
  const filter = {};
  if (venueId) filter.venueId = venueId;

  const timetable = await Timetable.find(filter).populate('venueId facultyId departmentId');
  res.json(timetable);
});
