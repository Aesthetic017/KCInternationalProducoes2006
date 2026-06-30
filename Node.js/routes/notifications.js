const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('order')
      .populate('user', 'name username email')
      .populate('interest')
      .populate({
        path: 'booking',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'user', select: 'name username email phone' },
        ],
      })
      .sort('-createdAt')
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/unread-count', protect, adminOnly, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/read-all', protect, adminOnly, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;