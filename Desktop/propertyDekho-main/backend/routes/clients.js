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
router.delete('/:id', getClient, async (req, res) => {
  try {
    await res.client.remove();
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
