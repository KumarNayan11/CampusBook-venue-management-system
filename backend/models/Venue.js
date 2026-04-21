const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['central', 'departmental'],
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function () {
      return this.type === 'departmental';
    },
    default: null,
  },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['available', 'maintenance'],
    default: 'available',
  },
  category: {
    type: String,
    enum: [
      'seminar_hall', 'auditorium', 'laboratory',
      'classroom', 'conference_room', 'sports_facility'
    ],
    required: true, // Set to true after C-08 migration assigns categories to all venues
  },
  booking_open_time: {
    type: String, // HH:mm
    default: '08:00',
  },
  booking_close_time: {
    type: String, // HH:mm
    default: '20:00',
  },
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
