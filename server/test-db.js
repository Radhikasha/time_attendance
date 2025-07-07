const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== Testing MongoDB Connection ===');
console.log('MongoDB URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/time-attendance');

// Simple test schema
const testSchema = new mongoose.Schema({
    name: String,
    timestamp: { type: Date, default: Date.now }
});

const Test = mongoose.model('Test', testSchema);

async function testConnection() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/time-attendance', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('✅ Successfully connected to MongoDB');
        
        // Test a simple insert
        console.log('Testing database write...');
        const testDoc = new Test({ name: 'Connection Test' });
        await testDoc.save();
        console.log('✅ Successfully wrote test document to database');
        
        // Test a simple query
        console.log('Testing database read...');
        const docs = await Test.find({});
        console.log('✅ Found', docs.length, 'documents in test collection');
        console.log('Latest test document:', JSON.stringify(docs[docs.length - 1], null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testConnection();
