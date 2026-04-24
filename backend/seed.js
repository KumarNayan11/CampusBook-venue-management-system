const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const Venue = require('./models/Venue');
const Booking = require('./models/Booking');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/venue-mgmt';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    console.log('Cleaning existing collections...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Venue.deleteMany({});
    await Booking.deleteMany({});

    // 2. Create Departments
    console.log('Creating departments...');
    const depts = [
      { name: 'Computer Science' },
      { name: 'Information Technology' },
      { name: 'Electronics & Communication' }
    ];
    const createdDepts = await Department.insertMany(depts);
    const csDept = createdDepts[0];
    const itDept = createdDepts[1];
    const ecDept = createdDepts[2];

    // 3. Create Users
    console.log('Creating system accounts...');
    
    // Admin
    await User.create({
      name: 'System Admin',
      email: 'admin@mits.edu',
      password: 'admin123',
      role: 'admin',
    });

    // DSW
    await User.create({
      name: 'DSW Officer',
      email: 'dsw@mits.edu',
      password: 'dsw123',
      role: 'dsw',
    });

    // HODs (Created without departmentId per user request for manual assignment)
    await User.create({
      name: 'HOD Computer Science',
      email: 'hod.cs@mits.edu',
      password: 'hod123',
      role: 'hod'
    });

    await User.create({
      name: 'HOD Information Technology',
      email: 'hod.it@mits.edu',
      password: 'hod123',
      role: 'hod'
    });

    // Faculty
    await User.create({
      name: 'Faculty User',
      email: 'faculty@mits.edu',
      password: 'faculty123',
      role: 'faculty',
      departmentId: csDept._id // Assigning to CS for immediate functionality
    });

    // 4. Create Sample Venues
    console.log('Deploying campus infrastructure...');
    
    const venues = [
      // Central Venues
      {
        name: 'Main Auditorium',
        type: 'central',
        capacity: 500,
        location: 'Admin Block',
        category: 'auditorium',
        status: 'available',
        booking_open_time: '09:00',
        booking_close_time: '18:00'
      },
      // Departmental Venues
      {
        name: 'CS Seminar Hall',
        type: 'departmental',
        departmentId: csDept._id,
        capacity: 100,
        location: 'CS Block',
        category: 'seminar_hall',
        status: 'available',
        booking_open_time: '10:00',
        booking_close_time: '16:00'
      },
      {
        name: 'IT Lab 1',
        type: 'departmental',
        departmentId: itDept._id,
        capacity: 50,
        location: 'IT Block',
        category: 'laboratory',
        status: 'available',
        booking_open_time: '09:00',
        booking_close_time: '17:00'
      }
    ];

    await Venue.insertMany(venues);

    console.log('\n✅ Seeding complete! Database ready.');
    console.log('-----------------------------------');
    console.log('Account Credentials:');
    console.log('- Admin:    admin@mits.edu / admin123');
    console.log('- DSW:      dsw@mits.edu / dsw123');
    console.log('- CS HOD:   hod.cs@mits.edu / hod123');
    console.log('- IT HOD:   hod.it@mits.edu / hod123');
    console.log('- Faculty:  faculty@mits.edu / faculty123');
    console.log('-----------------------------------');
    console.log('Note: HOD accounts created. Assign them to departments in the Admin Panel.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
