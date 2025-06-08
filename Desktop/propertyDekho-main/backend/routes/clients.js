const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single client
router.get('/:id', getClient, (req, res) => {
  res.json(res.client);
});

// Create client
router.post('/', async (req, res) => {
  const client = new Client({
    name: req.body.name,
    contact: req.body.contact,
    email: req.body.email,
    budget: req.body.budget,
    preferredLocation: req.body.preferredLocation,
    notes: req.body.notes
  });

  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update client
router.patch('/:id', getClient, async (req, res) => {
  try {
    Object.assign(res.client, req.body);
    const updatedClient = await res.client.save();
    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  console.log('Delete request received for client ID:', req.params.id);
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    console.log('Delete operation result:', client);
    if (!client) {
      console.log('Client not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Client not found', id: req.params.id });
    }
    console.log('Client deleted successfully:', client);
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ 
      message: 'Error deleting client', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Middleware to get client by ID
async function getClient(req, res, next) {
  let client;
  try {
    client = await Client.findById(req.params.id);
    if (client == null) {
      return res.status(404).json({ message: 'Cannot find client' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.client = client;
  next();
}

module.exports = router;
