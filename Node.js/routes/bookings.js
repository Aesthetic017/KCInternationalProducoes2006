const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Artist = require('../models/Artits');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/bookings — logged-in user requests to book an artist (quote-based)
// Body: { artistId, eventDate, eventType, message, country }
router.post('/', protect, async (req, res) => {
  try {
    const { artistId, eventDate, eventType, message, country } = req.body;
    if (!artistId || !eventDate || !eventType || !country) {
      return res.status(400).json({ message: 'Artist, event date, and event type are required' });
    }

    const artist = await Artist.findById(artistId);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    const booking = await Booking.create({
      user: req.user._id, artist: artistId, eventDate, eventType, message, country,
    });

    await Notification.create({
      type: 'new_booking',
      message: `${req.user.name} requested to book ${artist.name} for a ${eventType} on ${eventDate}`,
      booking: booking._id,
      user: req.user._id,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my — logged-in user's own booking requests
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('artist', 'name image').sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings — admin only, all booking requests
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('artist', 'name image')
      .populate('user', 'name username email phone')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id/resolve — admin confirms or declines, optionally with a quoted price
// Body: { status: 'confirmed'|'declined', quotedPrice, quotedCurrency }
router.put('/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const { status, quotedPrice, quotedCurrency } = req.body;
    if (!['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be confirmed or declined' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    if (quotedPrice !== undefined) booking.quotedPrice = quotedPrice;
    if (quotedCurrency) booking.quotedCurrency = quotedCurrency;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;