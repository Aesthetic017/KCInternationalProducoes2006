const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  country:  { type: String, enum: ['ao', 'uk'], required: true },
  role:     { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },

  // Password reset
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },

  // Email notification preferences
  emailNotifications: { type: Boolean, default: true },
  unsubscribeToken:   { type: String, unique: true, sparse: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate a unique, permanent unsubscribe token on creation
userSchema.pre('save', function (next) {
  if (this.isNew && !this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(24).toString('hex');
  }
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.statics.generateUsername = async function (name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let username;
  let exists = true;
  while (exists) {
    username = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    exists = await this.findOne({ username });
  }
  return username;
};

module.exports = mongoose.model('User', userSchema);