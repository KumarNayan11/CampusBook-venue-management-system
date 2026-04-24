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

  // ─── Snapshot fields ─────────────────────────────────────────────────────────
  // These are written at booking creation time so that logs remain readable
  // even if the related User, Venue, or Department is later deleted.
  snapshot: {
    userName:       { type: String, default: '' },
    userEmail:      { type: String, default: '' },
    venueName:      { type: String, default: '' },
    venueType:      { type: String, default: '' },  // 'central' | 'departmental'
    departmentName: { type: String, default: '' },  // empty string for central venues
    departmentId:   { type: mongoose.Schema.Types.ObjectId, default: null },
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
