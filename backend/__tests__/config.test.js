/**
 * C-07 System Config Tests
 * Tests GET /api/config and PUT /api/config endpoints
 * Also tests that booking creation uses min_advance_hours dynamically
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestDB } = require('./setup');
const app = require('../app');
const SystemConfig = require('../models/SystemConfig');
const Venue = require('../models/Venue');
const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

setupTestDB();

let adminUser, facultyUser, adminToken, facultyToken, testVenue, department;

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1d',
  });
};

beforeEach(async () => {
  department = await Department.create({ name: 'Test Dept' });

  const hashedPassword = await bcrypt.hash('testpass123', 10);

  adminUser = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: hashedPassword,
    role: 'admin',
  });

  facultyUser = await User.create({
    name: 'Faculty',
    email: 'faculty@test.com',
    password: hashedPassword,
    role: 'faculty',
    departmentId: department._id,
  });

  testVenue = await Venue.create({
    name: 'Test Hall',
    type: 'central',
    capacity: 100,
    status: 'available',
    category: 'seminar_hall',
    booking_open_time: '08:00',
    booking_close_time: '20:00',
  });

  adminToken = `Bearer ${generateToken(adminUser)}`;
  facultyToken = `Bearer ${generateToken(facultyUser)}`;
});

describe('C-07: GET /api/config', () => {
  test('should return default config when no document exists', async () => {
    const res = await request(app)
      .get('/api/config')
      .set('Authorization', adminToken);

    expect(res.status).toBe(200);
    expect(res.body.min_advance_hours).toBe(24);
  });

  test('should return stored config', async () => {
    await SystemConfig.create({ min_advance_hours: 48 });

    const res = await request(app)
      .get('/api/config')
      .set('Authorization', adminToken);

    expect(res.status).toBe(200);
    expect(res.body.min_advance_hours).toBe(48);
  });

  test('should reject non-admin access', async () => {
    const res = await request(app)
      .get('/api/config')
      .set('Authorization', facultyToken);

    expect(res.status).toBe(403);
  });
});

describe('C-07: PUT /api/config', () => {
  test('should create config if none exists', async () => {
    const res = await request(app)
      .put('/api/config')
      .set('Authorization', adminToken)
      .send({ min_advance_hours: 12 });

    expect(res.status).toBe(200);
    expect(res.body.config.min_advance_hours).toBe(12);

    // Verify persisted
    const config = await SystemConfig.findOne();
    expect(config.min_advance_hours).toBe(12);
  });

  test('should update existing config', async () => {
    await SystemConfig.create({ min_advance_hours: 24 });

    const res = await request(app)
      .put('/api/config')
      .set('Authorization', adminToken)
      .send({ min_advance_hours: 6 });

    expect(res.status).toBe(200);
    expect(res.body.config.min_advance_hours).toBe(6);
  });

  test('should reject negative values', async () => {
    const res = await request(app)
      .put('/api/config')
      .set('Authorization', adminToken)
      .send({ min_advance_hours: -5 });

    expect(res.status).toBe(400);
  });

  test('should reject missing min_advance_hours', async () => {
    const res = await request(app)
      .put('/api/config')
      .set('Authorization', adminToken)
      .send({});

    expect(res.status).toBe(400);
  });

  test('should reject non-admin access', async () => {
    const res = await request(app)
      .put('/api/config')
      .set('Authorization', facultyToken)
      .send({ min_advance_hours: 12 });

    expect(res.status).toBe(403);
  });
});

describe('C-07: Advance notice validation in booking creation', () => {
  test('should reject booking with insufficient advance notice', async () => {
    // Set min_advance_hours to 48
    await SystemConfig.create({ min_advance_hours: 48 });

    // Try to book 25 hours from now (less than 48)
    const date = new Date();
    date.setHours(date.getHours() + 25);
    const bookingDate = date.toISOString().split('T')[0];
    const hour = date.getHours().toString().padStart(2, '0');
    const startTime = `${hour}:00`;
    const endHour = (date.getHours() + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:00`;

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', facultyToken)
      .send({
        venueId: testVenue._id.toString(),
        date: bookingDate,
        startTime,
        endTime,
        purpose: 'Test advance notice',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/advance/i);
  });

  test('should allow booking with sufficient advance notice', async () => {
    // Set min_advance_hours to 1
    await SystemConfig.create({ min_advance_hours: 1 });

    // Book 30 days from now (way more than 1 hour)
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const bookingDate = date.toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', facultyToken)
      .send({
        venueId: testVenue._id.toString(),
        date: bookingDate,
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'Test advance notice ok',
      });

    expect(res.status).toBe(201);
  });
});
