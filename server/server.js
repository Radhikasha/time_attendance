// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/time-attendance', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Connect to the database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
