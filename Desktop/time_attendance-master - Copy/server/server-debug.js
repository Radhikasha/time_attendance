// Debug server with detailed logging
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'server-debug.log'), { flags: 'a' });

// Log function that writes to both console and file
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    process.stdout.write(logMessage);
    logStream.write(logMessage);
}

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
    log(`UNCAUGHT EXCEPTION: ${err.stack || err}`);
    process.exit(1);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log(`UNHANDLED REJECTION: ${reason.stack || reason}`);
});

log('=== Starting Debug Server ===');
log(`Node.js version: ${process.version}`);
log(`Current directory: ${__dirname}`);

// Initialize Express
const app = express();
log('Express application initialized');

// Middleware
app.use(express.json());
log('Express JSON middleware added');

// Simple route
app.get('/', (req, res) => {
    log('GET /');
    res.json({ 
        status: 'OK', 
        message: 'Debug server is running',
        timestamp: new Date().toISOString()
    });
});

// MongoDB Connection
log('Attempting to connect to MongoDB...');
mongoose.connect('mongodb://localhost:27017/time-attendance', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    log('✅ Successfully connected to MongoDB');
    
    // Start the server after successful DB connection
    const PORT = 5004; // Using a different port
    const HOST = '127.0.0.1';
    const server = app.listen(PORT, HOST, () => {
        log(`\n=== Server is running ===`);
        log(`Node.js: ${process.version}`);
        log(`Server: http://localhost:${PORT}`);
        log('\nPress Ctrl+C to stop\n');
    });

    // Handle server errors
    server.on('error', (error) => {
        log(`Server error: ${error.message}`);
        if (error.code === 'EADDRINUSE') {
            log(`Port ${PORT} is already in use`);
        }
        process.exit(1);
    });
})
.catch(err => {
    log(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
});
