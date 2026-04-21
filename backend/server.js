const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

const app = require('./app');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/venue-mgmt';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log('MongoDB Connected');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('Database connection error:', err);
        // Reset the promise cache so subsequent requests can retry
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
} else {
  // In production (Vercel serverless), start DB connection early during cold starts
  connectDB().catch(console.error);
}

// Export for Vercel serverless
// Wrap the Express app to ensure DB connection is established before handling requests
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless Route DB Connection Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database connection failed' }));
  }
};
