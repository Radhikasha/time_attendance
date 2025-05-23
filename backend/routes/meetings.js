const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// Get all meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('clientId')
      .populate('propertyId');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single meeting
router.get('/:id', getMeeting, (req, res) => {
  res.json(res.meeting);
});

// Create meeting
router.post('/', async (req, res) => {
  const meeting = new Meeting({
    clientId: req.body.clientId,
    propertyId: req.body.propertyId,
    date: req.body.date,
    time: req.body.time,
    notes: req.body.notes,
    status: req.body.status
  });

  try {
    const newMeeting = await meeting.save();
    res.status(201).json(newMeeting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update meeting
router.patch('/:id', getMeeting, async (req, res) => {
  try {
    Object.assign(res.meeting, req.body);
    const updatedMeeting = await res.meeting.save();
    res.json(updatedMeeting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete meeting
router.delete('/:id', getMeeting, async (req, res) => {
  try {
    await res.meeting.remove();
    res.json({ message: 'Meeting deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get meeting by ID
async function getMeeting(req, res, next) {
  let meeting;
  try {
    meeting = await Meeting.findById(req.params.id)
      .populate('clientId')
      .populate('propertyId');
    if (meeting == null) {
      return res.status(404).json({ message: 'Cannot find meeting' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.meeting = meeting;
  next();
}

module.exports = router;
