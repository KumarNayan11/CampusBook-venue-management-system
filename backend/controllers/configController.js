const SystemConfig = require('../models/SystemConfig');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/config
 * @access  Admin only
 * @desc    Returns the current system configuration
 */
exports.getConfig = asyncHandler(async (req, res) => {
  let config = await SystemConfig.findOne();
  if (!config) {
    // Return defaults if no config document exists yet
    config = { min_advance_hours: 24 };
  }
  res.json(config);
});

/**
 * @route   PUT /api/config
 * @access  Admin only
 * @desc    Updates system configuration (upserts if not present)
 */
exports.updateConfig = asyncHandler(async (req, res) => {
  const { min_advance_hours } = req.body;

  if (min_advance_hours == null) {
    res.status(400);
    throw new Error('min_advance_hours is required.');
  }

  if (typeof min_advance_hours !== 'number' || min_advance_hours < 0) {
    res.status(400);
    throw new Error('min_advance_hours must be a non-negative number.');
  }

  // Upsert: create if doesn't exist, update if it does
  const config = await SystemConfig.findOneAndUpdate(
    {},
    { min_advance_hours },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ message: 'Configuration updated', config });
});
