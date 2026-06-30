const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  icon:     { type: String, default: '🛍️' },
  image:    { type: String, default: '' },
  price:    { type: Number, required: true },
  currency: { type: String, default: '£' },
  country:  { type: String, enum: ['ao', 'uk'], required: true },

  // Category determines whether size/stock fields apply.
  // 'clothing' = tees, hoodies, hats, etc. — gets sizes + stock.
  // 'other' = CDs, USBs, gift cards, accessories — no sizes.
  category: { type: String, enum: ['clothing', 'other'], default: 'other' },

  // Only meaningful when category is 'clothing'.
  // Each size tracks its own stock count so admin can manage availability per size.
  sizes: [{
    size:  { type: String, enum: ['XS', 'S', 'M', 'L', 'XL'] },
    stock: { type: Number, default: 0 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);