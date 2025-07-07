// Main application file with Express and MongoDB integration
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');
const leaveRoutes = require('./routes/leaves');

// Initialize Express app
const app = express();

// Configure CORS with specific options
const allowedOrigins = ['http://localhost:3000'];

// CORS middleware function
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 204
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        node: process.version,
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaves', leaveRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/time-attendance', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n=== Server is running ===`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Node.js: ${process.version}`);
            console.log(`MongoDB: Connected to ${process.env.MONGO_URI || 'mongodb://localhost:27017/time-attendance'}`);
            console.log(`API: http://localhost:${PORT}/api/health`);
            console.log('\nPress Ctrl+C to stop the server\n');
        });

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\nShutting down server...');
            server.close(() => {
                console.log('Server stopped');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the application
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = app;
