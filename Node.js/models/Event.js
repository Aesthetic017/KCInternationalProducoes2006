const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  date:    { type: String, required: true },   // e.g. "14 JUL"
  venue:   { type: String, required: true },
  type:    { type: String, required: true },    // e.g. "Comedy", "Music", "Private"
  price:   { type: Number, default: 0 },         // ticket price shown to people
  country: { type: String, enum: ['ao', 'uk'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);