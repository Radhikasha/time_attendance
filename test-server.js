// Minimal Express server test
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Simple route
app.get('/', (req, res) => {
  res.json({
    message: 'Test server is running!',
    timestamp: new Date().toISOString(),
    node: process.version
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const server = app.listen(PORT, 'localhost', () => {
  console.log(`\n=== Test Server ===`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Node.js ${process.version}`);
  console.log('\nPress Ctrl+C to stop');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
