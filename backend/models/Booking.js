const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // Format HH:mm
  endTime: { type: String, required: true }, // Format HH:mm
  purpose: { type: String, required: true },
  requirements: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending_hod', 'pending_dsw', 'approved', 'rejected', 'withdrawn'],
    default: 'pending_hod',
  },
  approvedByHod: { type: Boolean, default: false },
  approvedByDsw: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
