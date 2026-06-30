const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 60 },
  message:  { type: String, required: true, trim: true, maxlength: 600 },
  stars:    { type: Number, required: true, min: 1, max: 5 },
  country:  { type: String, enum: ['ao', 'uk'], required: true },

  // Reviews are public the moment they're approved by an admin.
  // Anyone (no login required) can submit one, but it stays hidden until then.
  approved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);