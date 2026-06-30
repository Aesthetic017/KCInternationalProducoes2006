const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  eventDate: { type: String, required: true },   // free-text date the user wants
  eventType: { type: String, required: true },    // e.g. "Wedding", "Private party", "Corporate event"
  message:   { type: String, default: '' },
  country:   { type: String, enum: ['ao', 'uk'], required: true },
  status:    { type: String, enum: ['pending', 'confirmed', 'declined'], default: 'pending' },
  quotedPrice:    { type: Number, default: 0 }, // admin fills this in once they respond
  quotedCurrency: { type: String, default: '£' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);