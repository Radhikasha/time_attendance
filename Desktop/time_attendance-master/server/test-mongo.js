// Test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== Testing MongoDB Connection ===');
console.log('Node.js version:', process.version);
console.log('MongoDB URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/time-attendance');

// Simple test schema
const TestSchema = new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now }
});

const Test = mongoose.model('Test', TestSchema);

async function test() {
    try {
        console.log('Connecting to MongoDB...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/time-attendance', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('✅ Successfully connected to MongoDB');
        
        // Create a test document
        console.log('Creating test document...');
        const testDoc = new Test({ name: 'Connection Test' });
        await testDoc.save();
        console.log('✅ Test document created:', testDoc);
        
        // Count test documents
        const count = await Test.countDocuments();
        console.log(`✅ Total test documents: ${count}`);
        
        // Close the connection
        await mongoose.connection.close();
        console.log('✅ Connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

test();
