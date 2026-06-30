const express = require('express');
const router = express.Router();
const Interest = require('../models/Interest');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/interest — public, anyone (guest) can submit
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, type, country } = req.body;
    if (!name || !email || !message || !country) {
      return res.status(400).json({ message: 'Name, email, message and country are required' });
    }
    if (!['ao', 'uk'].includes(country)) {
      return res.status(400).json({ message: 'Invalid country' });
    }

    const interest = await Interest.create({ name, email, phone, message, type, country });

    await Notification.create({
      type: 'new_interest',
      message: `${name} (${email}) registered interest — ${type || 'General'}, ${country === 'ao' ? 'Angola' : 'UK'}`,
      interest: interest._id,
    });

    res.status(201).json({ message: 'Thank you — we will be in touch soon.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/interest — admin only, list all submissions
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const interests = await Interest.find().sort('-createdAt');
    res.json(interests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;