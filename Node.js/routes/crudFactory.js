const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { broadcastNewItem } = require('../utils/broadcast');

// Builds standard REST routes for a country-scoped content model.
// getAnnounceData(doc) -> { type, itemName, itemDesc } used for the broadcast email.
// If omitted, no broadcast email is sent on creation (useful if you ever add a model that shouldn't notify).
function buildCrudRouter(Model, getAnnounceData) {
  const router = express.Router();

  // Public — list items for a given country
  router.get('/:country', async (req, res) => {
    try {
      const { country } = req.params;
      if (!['ao', 'uk'].includes(country)) {
        return res.status(400).json({ message: 'Invalid country' });
      }
      const items = await Model.find({ country }).sort('-createdAt');
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin only — create, then broadcast to subscribed users in the background
  router.post('/', protect, adminOnly, async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);

      // Fire-and-forget — don't make the admin wait for every email to send
      if (getAnnounceData) {
        const { type, itemName, itemDesc } = getAnnounceData(item);
        broadcastNewItem({ country: item.country, type, itemName, itemDesc });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin only — update (no broadcast on edits, only on new creation)
  router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin only — delete
  router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted', id: req.params.id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
}

module.exports = buildCrudRouter;