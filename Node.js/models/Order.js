const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    itemId:   { type: String },
    type:     { type: String, enum: ['event', 'product', 'service', 'artist'], required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    currency: { type: String, default: '£' },
    qty:      { type: Number, default: 1 },
    image:    { type: String, default: '' },
    size:     { type: String, default: '' }, // only set for clothing products
  }],
  total:    { type: Number, required: true },
  currency: { type: String, default: '£' },
  country:  { type: String, enum: ['ao', 'uk'], required: true },

  status: {
    type: String,
    enum: ['completed', 'pending', 'cancel_requested', 'cancelled', 'return_requested', 'returned', 'exchange_requested', 'exchanged'],
    default: 'pending',
  },
  cancelReason: { type: String, default: '' },

  // Return/exchange request details
  returnType:    { type: String, enum: ['refund', 'exchange', ''], default: '' },
  returnReason:  { type: String, default: '' },
  exchangeSize:  { type: String, default: '' }, // requested new size, only for exchanges

  stripePaymentIntentId: { type: String },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded', 'refund_failed'], default: 'unpaid' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);