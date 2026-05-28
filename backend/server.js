const express = require('express');
const cors = require('cors');
require('dotenv').config();

// db.js ko import kiya
const connectDB = require('./config/db');
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database se connect kiya (Call the function)
connectDB();

// Routes
app.use('/api', inquiryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});