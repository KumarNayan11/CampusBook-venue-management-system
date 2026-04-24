const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Department = require('../models/Department');
const User = require('../models/User');

exports.getOverallAnalytics = async (req, res) => {
  try {
    const totalVenues = await Venue.countDocuments();
    const activeMaintenance = await Venue.countDocuments({ status: 'maintenance' });
    const totalBookings = await Booking.countDocuments({ status: { $ne: 'withdrawn' } });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const pendingBookings = await Booking.countDocuments({ status: { $in: ['pending_hod', 'pending_dsw'] } });

    // 1. Bookings by Department (Excluding withdrawn)
    const bookingsByDepartmentRaw = await Booking.aggregate([
      { $match: { status: { $ne: 'withdrawn' } } },
      { $lookup: { from: 'venues', localField: 'venueId', foreignField: '_id', as: 'venue' } },
      { $unwind: '$venue' },
      { $lookup: { from: 'departments', localField: 'venue.departmentId', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$dept.name', count: { $sum: 1 } } },
      { $project: { name: { $ifNull: ['$_id', 'Central'] }, count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // 2. Bookings by Venue & Top 3 Venues (Excluding withdrawn)
    const bookingsByVenue = await Booking.aggregate([
      { $match: { status: { $ne: 'withdrawn' } } },
      { $lookup: { from: 'venues', localField: 'venueId', foreignField: '_id', as: 'venue' } },
      { $unwind: '$venue' },
      { $group: { _id: '$venue.name', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    const topVenues = bookingsByVenue.slice(0, 3);

    // 3. Status Breakdown (Include all for transparency)
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    // 4. Booking Time Trend (Excluding withdrawn)
    const timeTrend = [];
    const bookings = await Booking.find({ status: { $ne: 'withdrawn' } }).select('date');
    const monthCounts = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    bookings.forEach(b => {
      if(b.date) {
        const m = new Date(b.date).getMonth();
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      }
    });
    for(let i=0; i<12; i++) {
       if(monthCounts[i] > 0) timeTrend.push({ name: monthNames[i], bookings: monthCounts[i] });
    }

    // 5. Venue Utilization (Excluding withdrawn)
    const allBookings = await Booking.find({ status: { $ne: 'withdrawn' } }).populate('venueId');
    const venueStats = {};
    allBookings.forEach(b => {
      const v = b.venueId;
      if (!v) return;
      if (!venueStats[v.name]) {
         let available = 10; // Default 10 hours if not specified
         if (v.booking_open_time && v.booking_close_time) {
            const sh = parseInt(v.booking_open_time.split(':')[0]);
            const eh = parseInt(v.booking_close_time.split(':')[0]);
            available = eh - sh;
         }
         venueStats[v.name] = { bookedHours: 0, availableDaily: available || 10 };
      }
      const bs = parseInt(b.startTime?.split(':')[0] || 0);
      const be = parseInt(b.endTime?.split(':')[0] || 0);
      venueStats[v.name].bookedHours += Math.max(0, be - bs);
    });
    
    const utilization = Object.keys(venueStats).map(name => {
       const stats = venueStats[name];
       const totalAvailableMonth = stats.availableDaily * 30; // 30 days
       const util = totalAvailableMonth > 0 ? (stats.bookedHours / totalAvailableMonth) * 100 : 0;
       return { name, utilization: Math.min(100, Math.round(util)) };
    }).sort((a,b) => b.utilization - a.utilization);

    res.json({
      totals: {
        totalVenues,
        totalBookings,
        approvedBookings,
        pendingBookings
      },
      totalVenues,
      totalBookings,
      approvedBookings,
      pendingBookings,
      bookingsByDepartment: bookingsByDepartmentRaw,
      bookingsByVenue,
      topVenues,
      statusBreakdown,
      timeTrend,
      utilization
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const departmentId = req.user.departmentId;
    
    const venues = await Venue.find({ departmentId }).select('_id name booking_open_time booking_close_time');
    const venueIds = venues.map(v => v._id);

    const totalVenues = venues.length;
    const totalBookings = await Booking.countDocuments({ venueId: { $in: venueIds }, status: { $ne: 'withdrawn' } });
    const pendingBookings = await Booking.countDocuments({ venueId: { $in: venueIds }, status: 'pending_hod' });
    const approvedBookings = await Booking.countDocuments({ venueId: { $in: venueIds }, status: 'approved' });

    const bookingsByVenueRaw = await Booking.aggregate([
      { $match: { venueId: { $in: venueIds }, status: { $ne: 'withdrawn' } } },
      { $lookup: { from: 'venues', localField: 'venueId', foreignField: '_id', as: 'venue' } },
      { $unwind: '$venue' },
      { $group: { _id: '$venue.name', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    const topVenues = bookingsByVenueRaw.slice(0, 3);

    const statusBreakdown = await Booking.aggregate([
      { $match: { venueId: { $in: venueIds } } },
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    const timeTrend = [];
    const deptBookings = await Booking.find({ 
      venueId: { $in: venueIds }, 
      status: { $ne: 'withdrawn' } 
    }).select('date startTime endTime venueId');
    const monthCounts = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    deptBookings.forEach(b => {
      if(b.date) {
        const m = new Date(b.date).getMonth();
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      }
    });
    for(let i=0; i<12; i++) {
       if(monthCounts[i] > 0) timeTrend.push({ name: monthNames[i], bookings: monthCounts[i] });
    }

    const venueStats = {};
    deptBookings.forEach(b => {
      const v = venues.find(ven => ven._id.toString() === b.venueId.toString());
      if (!v) return;
      if (!venueStats[v.name]) {
         let available = 10;
         if (v.booking_open_time && v.booking_close_time) {
            const sh = parseInt(v.booking_open_time.split(':')[0]);
            const eh = parseInt(v.booking_close_time.split(':')[0]);
            available = eh - sh;
         }
         venueStats[v.name] = { bookedHours: 0, availableDaily: available || 10 };
      }
      const bs = parseInt(b.startTime?.split(':')[0] || 0);
      const be = parseInt(b.endTime?.split(':')[0] || 0);
      venueStats[v.name].bookedHours += Math.max(0, be - bs);
    });
    
    const utilization = Object.keys(venueStats).map(name => {
       const stats = venueStats[name];
       const totalAvailableMonth = stats.availableDaily * 30;
       const util = totalAvailableMonth > 0 ? (stats.bookedHours / totalAvailableMonth) * 100 : 0;
       return { name, utilization: Math.min(100, Math.round(util)) };
    }).sort((a,b) => b.utilization - a.utilization);

    res.json({
      totals: {
        totalVenues,
        totalBookings,
        approvedBookings,
        pendingBookings
      },
      totalVenues,
      totalBookings,
      approvedBookings,
      pendingApproval: pendingBookings,
      pendingBookings,
      bookingsByVenue: bookingsByVenueRaw,
      topVenues,
      statusBreakdown,
      timeTrend,
      utilization
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicStats = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
       return res.status(503).json({ 
         message: 'Database not connected. Check Atlas IP whitelist (0.0.0.0/0) and MONGO_URI.' 
       });
    }

    const totalVenues = await Venue.countDocuments();
    const totalBookings = await Booking.countDocuments({ status: { $ne: 'withdrawn' } });
    const totalUsers = await User.countDocuments();
    
    res.json({
      totalVenues,
      totalBookings,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error: ' + error.message,
      tip: 'This indicates a database failure. Ensure MONGO_URI is correct and IP Whitelist is set.'
    });
  }
};
