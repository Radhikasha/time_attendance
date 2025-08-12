// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const attendanceRequestRoutes = require('./routes/attendanceRequest');
const adminRoutes = require('./routes/admin');
const leaveRoutes = require('./routes/leaves');

// Initialize Express app
const app = express();

// Middleware
// Development CORS configuration - allow all origins for development
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
app.use(express.json());

// HTTP request logging with morgan
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  },
  skip: (req) => req.url === '/health' // Skip health check logs
}));

// Simple request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }, 'Request processed');
  });
  
  next();
});

// Custom error handler middleware
app.use((err, req, res, next) => {
  // Log the error with Winston
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user.id : 'unauthenticated'
  }, 'Request error');

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors ? Object.values(err.errors).map(e => e.message) : [err.message]
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: 'Invalid or expired token'
    });
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error',
      error: 'A record with this value already exists'
    });
  }

  // Default error response
  const errorResponse = {
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(err.status || 500).json(errorResponse);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Database connection
const connectDB = async () => {
    // Try different connection strings if needed
    const connectionStrings = [
        process.env.MONGO_URI,
        'mongodb://127.0.0.1:27017/time-attendance?directConnection=true',
        'mongodb://localhost:27017/time-attendance?directConnection=true'
    ];

    const options = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        family: 4,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
    };

    let lastError = null;

    // Try each connection string until one works
    for (const uri of connectionStrings) {
        try {
            console.log(`\n🔹 Attempting to connect to MongoDB using: ${uri}`);
            const conn = await mongoose.connect(uri, options);
            
            console.log(`\n✅ MongoDB Connected Successfully!`);
            console.log(`   Host: ${conn.connection.host}`);
            console.log(`   Database: ${conn.connection.name}`);
            
            // Connection event handlers
            mongoose.connection.on('connected', () => {
                console.log('Mongoose: Connected to MongoDB');
            });

            mongoose.connection.on('error', (err) => {
                console.error('Mongoose connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Mongoose: Disconnected from MongoDB');
            });

            // If we get here, connection was successful
            return;
            
        } catch (error) {
            lastError = error;
            console.error(`❌ Connection failed: ${error.message}`);
            
            // If this isn't the last attempt, wait a bit before trying again
            if (uri !== connectionStrings[connectionStrings.length - 1]) {
                console.log('Trying next connection string...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // If we get here, all connection attempts failed
    console.error('\n❌ All MongoDB connection attempts failed!');
    console.error('Last error:', lastError.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if the database name is correct');
    console.log('3. Verify your connection string');
    console.log('4. Check if the MongoDB service is running (services.msc)');
    console.log('\nYou can start MongoDB manually with:');
    console.log('   mongod --dbpath="C:\\data\\db" --bind_ip_all');
    
    process.exit(1);
};

// Connect to the database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance/requests', attendanceRequestRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin', adminRoutes);

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
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
