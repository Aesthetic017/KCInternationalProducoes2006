const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/unsubscribe/:token — public, one-click unsubscribe from email link
router.get('/:token', async (req, res) => {
  try {
    const user = await User.findOne({ unsubscribeToken: req.params.token });
    if (!user) return res.status(404).json({ message: 'Invalid or expired unsubscribe link' });

    user.emailNotifications = false;
    await user.save();

    res.json({ message: 'Unsubscribed successfully', email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;