const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  desc:    { type: String, required: true },
  price:   { type: Number, default: 0 }, // 0 = "Contact us" / quote-based
  country: { type: String, enum: ['ao', 'uk'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);