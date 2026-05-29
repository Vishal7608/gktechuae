
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Database connection
const connectDB = require('./config/db');

// Routes
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Backend Running Successfully'
  });
});

// API Routes
app.use('/api', inquiryRoutes);

// Export app for Vercel
module.exports = app;

