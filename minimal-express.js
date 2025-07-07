// Minimal Express server with detailed error logging
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'express-debug.log'), { flags: 'a' });

// Log function that writes to both console and file
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    process.stdout.write(logMessage);
    logStream.write(logMessage);
}

// Initialize Express
const app = express();
const PORT = 3003;
const HOST = '127.0.0.1';

// Log unhandled exceptions
process.on('uncaughtException', (err) => {
    log(`UNCAUGHT EXCEPTION: ${err.stack || err}`);
    process.exit(1);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log(`UNHANDLED REJECTION: ${reason.stack || reason}`);
});

// Basic middleware with logging
app.use((req, res, next) => {
    log(`[${req.method}] ${req.url}`);
    next();
});

// Simple route
app.get('/', (req, res) => {
    log('Handling GET /');
    res.json({
        status: 'success',
        message: 'Minimal Express server is running',
        timestamp: new Date().toISOString(),
        node: process.version
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    log('Handling GET /health');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    log(`ERROR: ${err.stack || err}`);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    log(`404 - ${req.method} ${req.url}`);
    res.status(404).json({
        status: 'error',
        message: 'Not Found'
    });
});

// Start the server
const server = app.listen(PORT, HOST, () => {
    log(`\n=== Server Started ===`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`Node.js: ${process.version}`);
    log(`Server: http://${HOST}:${PORT}`);
    log('\nEndpoints:');
    log(`  GET  /         - Server info`);
    log(`  GET  /health   - Health check`);
    log('\nPress Ctrl+C to stop\n');
});

// Handle server errors
server.on('error', (error) => {
    log(`SERVER ERROR: ${error.stack || error}`);
    if (error.code === 'EADDRINUSE') {
        log(`Port ${PORT} is already in use`);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    log('\nShutting down server...');
    server.close(() => {
        log('Server stopped');
        logStream.end();
        process.exit(0);
    });
});
