/**
 * C-05 Withdraw Booking Tests
 * Also covers C-04 (DELETE restricted to admin only)
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestDB } = require('./setup');
const app = require('../app');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

setupTestDB();

let testVenue, testUser, otherUser, adminUser, authToken, otherToken, adminToken, department;

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1d',
  });
};

const futureDate = (daysAhead = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const pastDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

beforeEach(async () => {
  department = await Department.create({ name: 'Test Dept' });

  testVenue = await Venue.create({
    name: 'Test Hall',
    type: 'central',
    capacity: 100,
    status: 'available',
    category: 'seminar_hall',
    booking_open_time: '08:00',
    booking_close_time: '20:00',
  });

  const hashedPassword = await bcrypt.hash('testpass123', 10);

  testUser = await User.create({
    name: 'Test Faculty',
    email: 'faculty@test.com',
    password: hashedPassword,
    role: 'faculty',
    departmentId: department._id,
  });

  otherUser = await User.create({
    name: 'Other Faculty',
    email: 'other@test.com',
    password: hashedPassword,
    role: 'faculty',
    departmentId: department._id,
  });

  adminUser = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: hashedPassword,
    role: 'admin',
  });

  authToken = `Bearer ${generateToken(testUser)}`;
  otherToken = `Bearer ${generateToken(otherUser)}`;
  adminToken = `Bearer ${generateToken(adminUser)}`;
});

describe('C-05: withdrawBooking', () => {
  test('should withdraw a pending booking successfully', async () => {
    const booking = await Booking.create({
      userId: testUser._id,
      venueId: testVenue._id,
      date: futureDate(),
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Test',
      status: 'pending_dsw',
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/withdraw`)
      .set('Authorization', authToken);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('withdrawn');
  });

  test('should reject withdrawal by non-owner', async () => {
    const booking = await Booking.create({
      userId: testUser._id,
      venueId: testVenue._id,
      date: futureDate(),
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Test',
      status: 'pending_dsw',
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/withdraw`)
      .set('Authorization', otherToken);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/requester/i);
  });

  test('should reject withdrawal of already withdrawn booking', async () => {
    const booking = await Booking.create({
      userId: testUser._id,
      venueId: testVenue._id,
      date: futureDate(),
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Test',
      status: 'withdrawn',
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/withdraw`)
      .set('Authorization', authToken);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/withdrawn/i);
  });

  test('should reject withdrawal of rejected booking', async () => {
    const booking = await Booking.create({
      userId: testUser._id,
      venueId: testVenue._id,
      date: futureDate(),
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Test',
      status: 'rejected',
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/withdraw`)
      .set('Authorization', authToken);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/rejected/i);
  });

  test('should reject withdrawal after event has started', async () => {
    const booking = await Booking.create({
      userId: testUser._id,
      venueId: testVenue._id,
      date: pastDate(),
      startTime: '08:00',
      endTime: '10:00',
      purpose: 'Past event',
      status: 'approved',
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/withdraw`)
      .set('Authorization', authToken);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/after the event/i);
  });

  test('should return 404 for non-existent booking', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/bookings/${fakeId}/withdraw`)
      .set('Authorization', authToken);

    expect(res.status).toBe(404);
  });
});

describe('C-04: DELETE restricted to admin', () => {
  test('should allow admin to delete a booking', async () => {
    const booking = await Booking.create({
      userId: testUser._id,
      venueId: testVenue._id,
      date: futureDate(),
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Test',
      status: 'pending_dsw',
    });

    const res = await request(app)
      .delete(`/api/bookings/${booking._id}`)
      .set('Authorization', adminToken);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/purged/i);
  });

  test('should reject DELETE from faculty user', async () => {
    const booking = await Booking.create({
      userId: testUser._id,
      venueId: testVenue._id,
      date: futureDate(),
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Test',
      status: 'pending_dsw',
    });

    const res = await request(app)
      .delete(`/api/bookings/${booking._id}`)
      .set('Authorization', authToken);

    expect(res.status).toBe(403);
  });
});
