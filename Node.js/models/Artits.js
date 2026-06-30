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

  // Booking configuration — admin sets per artist
  bookingType:  { type: String, enum: ['fixed', 'quote'], default: 'quote' },
  bookingPrice: { type: Number, default: 0 }, // only used when bookingType is 'fixed'
  bookingCurrency: { type: String, default: '£' },
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);