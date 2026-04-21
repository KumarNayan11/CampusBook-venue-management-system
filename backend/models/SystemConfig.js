const mongoose = require('mongoose');

/**
 * SystemConfig — single-document collection for global system settings.
 * Only one document should exist; use findOne() to retrieve it.
 * If no document exists, the default values below will be used by the application.
 */
const systemConfigSchema = new mongoose.Schema({
  min_advance_hours: {
    type: Number,
    default: 24,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
