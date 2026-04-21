/**
 * CampusBook — Venue Field Migration Script (C-08)
 * 
 * Run this BEFORE deploying schema changes from C-01.
 * Idempotent — safe to re-run.
 * 
 * Usage: node scripts/migrate_venue_fields.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import the model AFTER dotenv so connection string is available
const Venue = require('../models/Venue');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/venue-mgmt';

// Known seed venue → category mappings
const CATEGORY_MAPPINGS = [
  { namePattern: /^Auditorium$/i, category: 'auditorium' },
  { namePattern: /^CSE Seminar Hall$/i, category: 'seminar_hall' },
];

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for migration...\n');

  // 1. Set default booking hours on all venues missing them
  const hoursResult = await Venue.updateMany(
    { booking_open_time: { $exists: false } },
    { $set: { booking_open_time: '08:00', booking_close_time: '20:00' } }
  );
  console.log(`[booking hours] Updated ${hoursResult.modifiedCount} venue(s) with default open/close times.`);

  // Also catch venues where fields exist but are null/undefined
  const hoursNullResult = await Venue.updateMany(
    { $or: [{ booking_open_time: null }, { booking_close_time: null }] },
    { $set: { booking_open_time: '08:00', booking_close_time: '20:00' } }
  );
  console.log(`[booking hours] Fixed ${hoursNullResult.modifiedCount} venue(s) with null open/close times.`);

  // 2. Apply known category mappings for seed venues
  for (const mapping of CATEGORY_MAPPINGS) {
    const result = await Venue.updateMany(
      { name: { $regex: mapping.namePattern }, category: { $exists: false } },
      { $set: { category: mapping.category } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[category] Assigned '${mapping.category}' to ${result.modifiedCount} venue(s) matching '${mapping.namePattern}'.`);
    }
  }

  // Also catch null categories for known venues
  for (const mapping of CATEGORY_MAPPINGS) {
    const result = await Venue.updateMany(
      { name: { $regex: mapping.namePattern }, category: null },
      { $set: { category: mapping.category } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[category] Fixed null category for ${result.modifiedCount} venue(s) matching '${mapping.namePattern}'.`);
    }
  }

  // 3. Report venues still missing category for manual review
  const uncategorised = await Venue.find({
    $or: [{ category: { $exists: false } }, { category: null }]
  });

  if (uncategorised.length > 0) {
    console.log(`\n⚠️  Venues requiring manual category assignment: ${uncategorised.length}`);
    uncategorised.forEach(v => console.log(`   - ${v._id}  ${v.name}`));
    console.log('\nAssign categories via Admin UI or directly in MongoDB before making category required: true.');
  } else {
    console.log('\n✅ All venues have a category assigned.');
  }

  console.log('\nMigration complete.');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
