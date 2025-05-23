const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single property
router.get('/:id', getProperty, (req, res) => {
  res.json(res.property);
});

// Create property
router.post('/', async (req, res) => {
  console.log('Received property data:', req.body);
  
  try {
    // Basic validation
    if (!req.body.title || !req.body.location) {
      return res.status(400).json({ message: 'Title and location are required' });
    }
    
    // Validate coordinates format if provided
    if (req.body.coordinates) {
      const coords = req.body.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length !== 2 || coords.some(isNaN)) {
        return res.status(400).json({ 
          message: 'Invalid coordinates format. Use: latitude,longitude (e.g., 20.5937,78.9629)' 
        });
      }
    }
    
    const property = new Property({
      title: req.body.title,
      image: req.body.image || '',
      location: req.body.location,
      coordinates: req.body.coordinates || '20.5937, 78.9629',
      size: parseFloat(req.body.size) || 0,
      price: parseFloat(req.body.price) || 0,
      type: req.body.type || 'Plot',
      status: req.body.status || 'Available'
    });
    
    console.log('Creating property:', property);
    const newProperty = await property.save();
    console.log('Property created successfully:', newProperty);
    
    res.status(201).json(newProperty);
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(400).json({ 
      message: 'Failed to create property',
      error: err.message 
    });
  }
});

// Update property
router.patch('/:id', getProperty, async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Update request body:', req.body);
    
    // Get the property to update
    const property = res.property;
    
    // List of allowed fields that can be updated
    const allowedUpdates = [
      'title', 'description', 'location', 'size', 'price', 
      'type', 'status', 'image', 'coordinates'
    ];
    
    // Update only the fields that are present in the request body
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        property[field] = field === 'size' || field === 'price' 
          ? parseFloat(req.body[field]) || 0 
          : req.body[field];
      }
    });
    
    // Save the updated property
    const updatedProperty = await property.save();
    console.log('Property updated successfully:', updatedProperty);
    
    res.json(updatedProperty);
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(400).json({ 
      message: 'Failed to update property',
      error: err.message 
    });
  }
});

// Delete property
router.delete('/:id', getProperty, async (req, res) => {
  try {
    await res.property.remove();
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get property by ID
async function getProperty(req, res, next) {
  let property;
  try {
    property = await Property.findById(req.params.id);
    if (property == null) {
      return res.status(404).json({ message: 'Cannot find property' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.property = property;
  next();
}

module.exports = router;
