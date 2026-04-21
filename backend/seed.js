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
      { name: 'Computer Science & Engineering' },
      { name: 'Information Technology' },
      { name: 'Electrical Engineering' },
      { name: 'Mechanical Engineering' },
      { name: 'Civil Engineering' }
    ];
    const createdDepts = await Department.insertMany(depts);
    const cseDept = createdDepts[0];
    const itDept = createdDepts[1];

    // 3. Create Users
    console.log('Creating system accounts...');
    
    // Admin
    await User.create({
      name: 'Super Admin',
      email: 'admin@mits.edu',
      password: 'admin123',
      role: 'admin',
    });

    // DSW
    await User.create({
      name: 'Dr. R.K. Gupta (DSW)',
      email: 'dsw@mits.edu',
      password: 'dsw123',
      role: 'dsw',
    });

    // HODs
    const hodCse = await User.create({
      name: 'Dr. Manish Dixit',
      email: 'hod.cse@mits.edu',
      password: 'hod123',
      role: 'hod',
      departmentId: cseDept._id,
    });
    
    // Link HOD to Department
    cseDept.hodId = hodCse._id;
    await cseDept.save();

    // Faculty
    await User.create({
      name: 'Prof. Aditya Bansal',
      email: 'faculty@mits.edu',
      password: 'faculty123',
      role: 'faculty',
      departmentId: cseDept._id,
    });

    // 4. Create Venues
    console.log('Deploying campus infrastructure...');
    
    const venues = [
      // Central Venues
      {
        name: 'Madanrao Scindia Auditorium (MAC)',
        type: 'central',
        capacity: 800,
        location: 'Main Block, Ground Floor',
        category: 'auditorium',
        status: 'available',
        booking_open_time: '09:00',
        booking_close_time: '21:00'
      },
      {
        name: 'Open Air Theatre (OAT)',
        type: 'central',
        capacity: 1500,
        location: 'Near Hostel Block',
        category: 'sports_facility',
        status: 'available',
        booking_open_time: '06:00',
        booking_close_time: '22:00'
      },
      {
        name: 'Central Seminar Hall 1',
        type: 'central',
        capacity: 200,
        location: 'IT Block, 2nd Floor',
        category: 'seminar_hall',
        status: 'available',
        booking_open_time: '08:00',
        booking_close_time: '19:00'
      },
      // Departmental Venues (CSE)
      {
        name: 'CSE Seminar Hall (SH-1)',
        type: 'departmental',
        departmentId: cseDept._id,
        capacity: 120,
        location: 'CSE Block, 1st Floor',
        category: 'seminar_hall',
        status: 'available',
        booking_open_time: '09:30',
        booking_close_time: '17:30'
      },
      {
        name: 'Advanced Computing Lab',
        type: 'departmental',
        departmentId: cseDept._id,
        capacity: 60,
        location: 'CSE Block, Lab Wing',
        category: 'laboratory',
        status: 'available',
        booking_open_time: '09:30',
        booking_close_time: '16:30'
      },
      // Departmental Venues (IT)
      {
        name: 'IT Smart Classroom (SC-1)',
        type: 'departmental',
        departmentId: itDept._id,
        capacity: 70,
        location: 'IT Block, 1st Floor',
        category: 'classroom',
        status: 'available',
        booking_open_time: '08:00',
        booking_close_time: '18:00'
      }
    ];

    await Venue.insertMany(venues);

    console.log('\n✅ Seeding complete! Database ready.');
    console.log('-----------------------------------');
    console.log('Credentials:');
    console.log('- Admin:    admin@mits.edu / admin123');
    console.log('- DSW:      dsw@mits.edu / dsw123');
    console.log('- CSE HOD:  hod.cse@mits.edu / hod123');
    console.log('- Faculty:  faculty@mits.edu / faculty123');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
