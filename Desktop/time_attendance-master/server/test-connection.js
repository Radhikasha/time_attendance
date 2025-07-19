const mongoose = require('mongoose');
require('dotenv').config();

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
