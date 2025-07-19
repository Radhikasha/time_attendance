// Simple HTTP server using Node.js http module
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5002; // Using a different port to avoid conflicts

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Simple routing
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Simple HTTP Server is running',
            timestamp: new Date().toISOString(),
            node: process.version
        }));
    } else if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage()
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=== Simple HTTP Server ===`);
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Node.js ${process.version}`);
    console.log('\nEndpoints:');
    console.log(`  GET  /         - Basic server info`);
    console.log(`  GET  /health   - Health check`);
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

// Error handling
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
});
