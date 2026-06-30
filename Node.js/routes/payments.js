const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const { sendPaymentConfirmationEmail } = require('../utils/email');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, async (req, res) => {
  try {
    const { items, total, currency, country } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    if (!['ao', 'uk'].includes(country)) return res.status(400).json({ message: 'Invalid country' });

    const amountInSmallestUnit = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'gbp',
      metadata: { userId: req.user._id.toString(), country },
      automatic_payment_methods: { enabled: true },
    });

    const order = await Order.create({
      user: req.user._id,
      items, total, currency, country,
      status: 'pending',
      paymentStatus: 'unpaid',
      stripePaymentIntentId: paymentIntent.id,
    });

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    try {
      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'completed', paymentStatus: 'paid' },
        { new: true }
      ).populate('user', 'name email country');

      if (order) {
        // Deduct stock for any clothing items purchased (size-specific)
        for (const item of order.items) {
          if (item.type === 'product' && item.size && item.itemId) {
            try {
              await Product.updateOne(
                { _id: item.itemId, 'sizes.size': item.size },
                { $inc: { 'sizes.$.stock': -item.qty } }
              );
            } catch (stockErr) {
              console.error('Failed to deduct stock:', stockErr.message);
            }
          }
        }

        await Notification.create({
          type: 'new_order',
          message: `${order.user.name} paid ${order.currency}${order.total.toFixed(2)} (${order.country === 'ao' ? 'Angola' : 'UK'})`,
          order: order._id,
          user: order.user._id,
        });

        // Email the customer a payment confirmation with items, amount, and payment ID
        try {
          await sendPaymentConfirmationEmail({
            to: order.user.email,
            name: order.user.name,
            country: order.country,
            items: order.items,
            total: order.total,
            currency: order.currency,
            paymentIntentId: order.stripePaymentIntentId,
            siteUrl: `${process.env.CLIENT_URL}/account`,
          });
        } catch (emailErr) {
          console.error('Failed to send payment confirmation email:', emailErr.message);
        }
      }
    } catch (err) {
      console.error('Failed to update order after payment success:', err.message);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { paymentStatus: 'unpaid' }
    );
  }

  res.json({ received: true });
});

module.exports = router;