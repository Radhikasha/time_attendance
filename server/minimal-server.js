// Minimal Express server to test basic functionality
require('dotenv').config();
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.json({ message: 'Hello, World!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Minimal test server running on port ${PORT}`);
    console.log(`Try accessing: http://localhost:${PORT}/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);    
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
