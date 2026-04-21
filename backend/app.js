const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./middleware/loggerMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Trust Vercel proxy (important for rate limiting and correct IP detection)
app.set('trust proxy', 1);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Health check route (useful for deployment verification)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply rate limiter to auth routes
app.use('/api/auth', authLimiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const venueRoutes = require('./routes/venueRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const configRoutes = require('./routes/configRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config', configRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;