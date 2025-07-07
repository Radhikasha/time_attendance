// Start the server with enhanced error handling and logging
console.log('=== Starting Time Attendance System ===');
console.log(`Node.js ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Current directory: ${process.cwd()}`);

// Load environment variables
require('dotenv').config();

// Start the application
require('./app');
