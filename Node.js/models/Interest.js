const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String, default: '' },
  message: { type: String, required: true },
  type:    { type: String, default: 'General' }, // enquiry type selected in the form
  country: { type: String, enum: ['ao', 'uk'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Interest', interestSchema);