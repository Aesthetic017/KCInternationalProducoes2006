const express = require('express');
const buildCrudRouter = require('./crudFactory');
const Artist = require('../models/Artits');
const { protect, adminOnly } = require('../middleware/auth');

const router = buildCrudRouter(Artist, (doc) => ({
  type: 'artist',
  itemName: doc.name,
  itemDesc: doc.genre,
}));

// POST /api/artists/:id/media — admin adds one video or track to an existing artist
// Body: { kind: 'video'|'track', source: 'upload'|'link', url, title }
router.post('/:id/media', protect, adminOnly, async (req, res) => {
  try {
    const { kind, source, url, title } = req.body;
    if (!['video', 'track'].includes(kind)) return res.status(400).json({ message: 'kind must be video or track' });
    if (!['upload', 'link'].includes(source)) return res.status(400).json({ message: 'source must be upload or link' });
    if (!url) return res.status(400).json({ message: 'url is required' });

    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { $push: { media: { kind, source, url, title: title || '' } } },
      { new: true, runValidators: true }
    );
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/artists/:id/media/:mediaId — admin removes one media item
router.delete('/:id/media/:mediaId', protect, adminOnly, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { $pull: { media: { _id: req.params.mediaId } } },
      { new: true }
    );
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;