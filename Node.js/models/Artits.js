const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  genre:    { type: String, required: true, trim: true },
  badge:    { type: String, default: '' },
  rating:   { type: Number, default: 4.5, min: 0, max: 5 },
  tracks:   { type: Number, default: 0 },
  country:  { type: String, enum: ['ao', 'uk'], required: true },
  image:    { type: String, default: '' },
  socials: {
    instagram: { type: String, default: '' },
    tiktok:    { type: String, default: '' },
    youtube:   { type: String, default: '' },
    spotify:   { type: String, default: '' },
  },

  bookingType:  { type: String, enum: ['fixed', 'quote'], default: 'quote' },
  bookingPrice: { type: Number, default: 0 },
  bookingCurrency: { type: String, default: '£' },

  // Videos and music tracks — admin can either upload a file directly or paste a link
  // (YouTube for video, Spotify/SoundCloud for tracks). `url` holds whichever was provided.
  media: [{
    kind:   { type: String, enum: ['video', 'track'], required: true },
    source: { type: String, enum: ['upload', 'link'], required: true },
    url:    { type: String, required: true },
    title:  { type: String, default: '' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);