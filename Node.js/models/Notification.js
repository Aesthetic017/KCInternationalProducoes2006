const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_order', 'cancel_request', 'new_user', 'new_interest', 'new_booking', 'return_request', 'exchange_request', 'new_review'],
    required: true,
  },
  message: { type: String, required: true },
  order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interest: { type: mongoose.Schema.Types.ObjectId, ref: 'Interest' },
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  review:   { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);