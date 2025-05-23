const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  coordinates: {
    type: String,
    default: '20.5937, 78.9629' // Stored as "lat, lng"
  },
  size: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['Plot', 'Flat', 'Commercial'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Available', 'Under Negotiation', 'Sold'], 
    default: 'Available' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
