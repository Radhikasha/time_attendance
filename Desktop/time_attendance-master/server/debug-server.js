// Debug Express server with detailed logging
require('dotenv').config();
const express = require('express');

console.log('=== Starting Debug Server ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', __dirname);
console.log('Environment:', process.env.NODE_ENV || 'development');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// Basic route
app.get('/', (req, res) => {
    console.log('Handling GET /');
    res.json({ 
        message: 'Debug Server is running',
        timestamp: new Date().toISOString(),
        node: process.version,
        platform: process.platform,
        arch: process.arch
    });
});

// Health check
app.get('/health', (req, res) => {
    console.log('Handling GET /health');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.warn(`404 - ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not Found' });
});

// Start server
const PORT = process.env.PORT || 5001; // Using different port to avoid conflicts
const server = app.listen(PORT, '0.0.0.0', () => {
    const address = server.address();
    console.log(`\n=== Server is running ===`);
    console.log(`Listening on: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Node.js: ${process.version}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
    console.log('\nPress Ctrl+C to stop the server\n');
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => process.exit(1));
});
