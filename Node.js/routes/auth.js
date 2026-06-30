const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPasswordResetEmail } = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  phone: user.phone,
  country: user.country,
  role: user.role,
  emailNotifications: user.emailNotifications,
});

// ─── POST /api/auth/register ───────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, country } = req.body;

    if (!name || !email || !phone || !password || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['ao', 'uk'].includes(country)) {
      return res.status(400).json({ message: 'Please select a valid country' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const username = await User.generateUsername(name);
    const user = await User.create({ name, email, phone, password, country, username });

    await Notification.create({
      type: 'new_user',
      message: `${name} just joined from ${country === 'ao' ? 'Angola' : 'the UK'}`,
      user: user._id,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/forgot-password ─────────────────────────
// Body: { email }
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond the same way whether or not the email exists —
    // prevents leaking which emails are registered.
    const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };

    if (!user) return res.json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    } catch (emailErr) {
      // Roll back the token if the email genuinely failed to send
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error('Failed to send reset email:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }

    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/reset-password/:token ───────────────────
// Body: { password }
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ message: 'Password reset successful', token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
  res.json(sanitize(req.user));
});

// ─── PUT /api/auth/me ────────────────────────────────────────
// Logged-in user updates their own name / email / phone.
// Body: { name, email, phone }
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email, phone, emailNotifications } = req.body;
    const user = req.user;

    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ message: 'That email is already in use' });
      user.email = email.toLowerCase();
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (typeof emailNotifications === 'boolean') user.emailNotifications = emailNotifications;

    await user.save();
    res.json(sanitize(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/auth/change-password ───────────────────────────
// Logged-in user changes their password (knows current one).
// Body: { currentPassword, newPassword }
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // req.user from the protect middleware excludes password — re-fetch it here
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;