// Minimal Express server with MongoDB
const express = require('express');
const mongoose = require('mongoose');

console.log('=== Starting Minimal Express Server ===');
console.log('Node.js version:', process.version);

const app = express();

// Basic middleware
app.use(express.json());

// Simple route
app.get('/', (req, res) => {
    res.json({ message: 'Minimal Express Server is running', timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/time-attendance', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = 5003; // Using a different port
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=== Server is running ===`);
    console.log(`Node.js: ${process.version}`);
    console.log(`Server: http://localhost:${PORT}`);
    console.log('\nEndpoints:');
    console.log(`  GET  /         - Server info`);
    console.log(`  GET  /health   - Health check`);
    console.log('\nPress Ctrl+C to stop\n');
});

// Error handling
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
