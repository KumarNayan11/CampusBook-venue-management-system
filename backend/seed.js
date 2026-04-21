const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const Venue = require('./models/Venue');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/venue-mgmt');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Venue.deleteMany({});
    await require('./models/Booking').deleteMany({});
    await require('./models/Timetable').deleteMany({});

    // Create Departments
    const cseDept = await Department.create({ name: 'Computer Science' });
    const eceDept = await Department.create({ name: 'Electronics & Communication' });

    // Create Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@college.edu',
      password: 'adminpassword',
      role: 'admin',
    });

    // Create DSW
    const dsw = await User.create({
      name: 'DSW Officer',
      email: 'dsw@college.edu',
      password: 'dswpassword',
      role: 'dsw',
    });

    // Create HOD
    const hod = await User.create({
      name: 'CSE HOD',
      email: 'hod.cse@college.edu',
      password: 'hodpassword',
      role: 'hod',
      departmentId: cseDept._id,
    });
    
    cseDept.hodId = hod._id;
    await cseDept.save();

    // Create Faculty
    const faculty = await User.create({
      name: 'Dr. Smith',
      email: 'smith@college.edu',
      password: 'facultypassword',
      role: 'faculty',
      departmentId: cseDept._id,
    });

    // Create Venues
    await Venue.create({
      name: 'Auditorium',
      type: 'central',
      capacity: 500,
      status: 'available'
    });

    await Venue.create({
      name: 'CSE Seminar Hall',
      type: 'departmental',
      departmentId: cseDept._id,
      capacity: 100,
      status: 'available'
    });

    console.log('Seeding complete! User logins:');
    console.log('- Admin: admin@college.edu / adminpassword');
    console.log('- HOD: hod.cse@college.edu / hodpassword');
    console.log('- Faculty: smith@college.edu / facultypassword');
    console.log('- DSW: dsw@college.edu / dswpassword');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
