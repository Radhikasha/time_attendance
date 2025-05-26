const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Set JWT secret if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_jwt_secret';
  console.warn('WARNING: JWT_SECRET is not set. Using default secret for development.');
}

const app = express();

// Logging middleware
app.use(morgan('dev'));

// Body parser middleware with increased limits
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received');
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 50000
}));

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealsmart')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Add cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/testAuth'));  // Using test auth routes
app.use('/api/properties', require('./routes/properties'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/meetings', require('./routes/meetings'));

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/properties`);
  console.log(`- GET http://localhost:${PORT}/api/clients`);
  console.log(`- GET http://localhost:${PORT}/api/meetings`);
});
