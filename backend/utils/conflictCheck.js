const Booking = require('../models/Booking');
const Timetable = require('../models/Timetable');
const moment = require('moment');

/**
 * Checks for overlapping time slots.
 * @param {string} start1 - Slot 1 start time (HH:mm)
 * @param {string} end1 - Slot 1 end time (HH:mm)
 * @param {string} start2 - Slot 2 start time (HH:mm)
 * @param {string} end2 - Slot 2 end time (HH:mm)
 * @returns {boolean} - True if they overlap
 */
const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = moment(start1, 'HH:mm');
  const e1 = moment(end1, 'HH:mm');
  const s2 = moment(start2, 'HH:mm');
  const e2 = moment(end2, 'HH:mm');

  return s1.isBefore(e2) && s2.isBefore(e1);
};

/**
 * Checks for booking conflicts with existing approved reservations and the academic timetable.
 */
const checkConflicts = async (venueId, date, startTime, endTime) => {
  // 1. Normalize input times
  const normalizedStart = moment(startTime, ['HH:mm', 'H:mm']).format('HH:mm');
  const normalizedEnd = moment(endTime, ['HH:mm', 'H:mm']).format('HH:mm');

  // 2. Check against existing APPROVED and PENDING bookings
  const existingBookings = await Booking.find({
    venueId,
    date,
    status: { $in: ['pending_hod', 'pending_dsw', 'approved'] },
  });

  for (const booking of existingBookings) {
    if (isOverlapping(normalizedStart, normalizedEnd, booking.startTime, booking.endTime)) {
      return { 
        conflict: true, 
        reason: `Slot partially occupied by an approved booking (${booking.startTime} - ${booking.endTime}).` 
      };
    }
  }

  // 3. Check against Academic Timetable
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bookingDay = days[new Date(date).getDay()];

  const timetableSchedules = await Timetable.find({
    venueId,
    day: { $regex: new RegExp(`^${bookingDay}$`, 'i') } // Case-insensitive day match
  });

  for (const schedule of timetableSchedules) {
    if (isOverlapping(normalizedStart, normalizedEnd, schedule.startTime, schedule.endTime)) {
      return { 
        conflict: true, 
        reason: `Scheduled Academic Activity: ${schedule.subject} (${schedule.startTime} - ${schedule.endTime}).` 
      };
    }
  }

  return { conflict: false };
};

module.exports = { checkConflicts, isOverlapping };
