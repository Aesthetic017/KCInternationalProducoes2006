const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/reviews/:country — public, approved reviews only
router.get('/:country', async (req, res) => {
  try {
    const { country } = req.params;
    if (!['ao', 'uk'].includes(country)) {
      return res.status(400).json({ message: 'Invalid country' });
    }
    const reviews = await Review.find({ country, approved: true }).sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews — public, anyone can submit (no login required), starts unapproved
router.post('/', async (req, res) => {
  try {
    const { name, message, stars, country } = req.body;
    if (!name || !message || !stars || !country) {
      return res.status(400).json({ message: 'name, message, stars and country are required' });
    }
    if (!['ao', 'uk'].includes(country)) {
      return res.status(400).json({ message: 'Invalid country' });
    }
    const starsNum = Number(stars);
    if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
      return res.status(400).json({ message: 'stars must be a whole number between 1 and 5' });
    }

    const review = await Review.create({
      name: String(name).slice(0, 60),
      message: String(message).slice(0, 600),
      stars: starsNum,
      country,
      approved: false,
    });

    await Notification.create({
      type: 'new_review',
      message: `${review.name} left a ${review.stars}★ review (${country === 'ao' ? 'Angola' : 'UK'}) — pending approval`,
      review: review._id,
    });

    res.status(201).json({ message: 'Thanks! Your review will appear once approved.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/admin/all — admin only, every review (pending + approved)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reviews/:id/approve — admin only
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reviews/:id/reject — admin only — rejecting just deletes it
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;