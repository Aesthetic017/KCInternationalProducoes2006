const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const { sendRefundConfirmationEmail } = require('../utils/email');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/cancel-request — user cancels before it ships
router.put('/:id/cancel-request', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to modify this order' });
    }
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Only paid orders can be cancelled' });
    }
    if (['cancelled', 'cancel_requested', 'return_requested', 'returned', 'exchange_requested', 'exchanged'].includes(order.status)) {
      return res.status(400).json({ message: 'This order already has a pending or completed request' });
    }

    order.status = 'cancel_requested';
    order.cancelReason = req.body.reason || '';
    await order.save();

    await Notification.create({
      type: 'cancel_request',
      message: `${req.user.name} requested to cancel an order (${order.currency}${order.total.toFixed(2)})`,
      order: order._id,
      user: req.user._id,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/return-request — user requests a refund or exchange after receiving the item
// Body: { returnType: 'refund'|'exchange', returnReason, exchangeSize (only for exchange) }
router.put('/:id/return-request', protect, async (req, res) => {
  try {
    const { returnType, returnReason, exchangeSize } = req.body;
    if (!['refund', 'exchange'].includes(returnType)) {
      return res.status(400).json({ message: 'returnType must be refund or exchange' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to modify this order' });
    }
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed orders can be returned or exchanged' });
    }

    order.status = returnType === 'refund' ? 'return_requested' : 'exchange_requested';
    order.returnType = returnType;
    order.returnReason = returnReason || '';
    if (returnType === 'exchange') order.exchangeSize = exchangeSize || '';
    await order.save();

    await Notification.create({
      type: returnType === 'refund' ? 'return_request' : 'exchange_request',
      message: `${req.user.name} requested ${returnType === 'refund' ? 'a refund' : `an exchange (new size: ${exchangeSize})`} — ${order.currency}${order.total.toFixed(2)}`,
      order: order._id,
      user: req.user._id,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/resolve-cancel — admin approves/rejects a cancellation, refunds via Stripe if approved
router.put('/:id/resolve-cancel', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!req.body.approve) {
      order.status = 'completed';
      await order.save();
      return res.json(order);
    }

    if (order.paymentStatus === 'paid' && order.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
        order.paymentStatus = 'refunded';
      } catch (refundErr) {
        order.paymentStatus = 'refund_failed';
        await order.save();
        return res.status(500).json({ message: `Refund failed: ${refundErr.message}` });
      }
    }

    order.status = 'cancelled';
    await order.save();

    if (order.paymentStatus === 'refunded' && order.user?.email) {
      try {
        await sendRefundConfirmationEmail({
          to: order.user.email, name: order.user.name, country: order.country,
          items: order.items, total: order.total, currency: order.currency,
          paymentIntentId: order.stripePaymentIntentId,
          siteUrl: `${process.env.CLIENT_URL}/account`,
        });
      } catch (emailErr) {
        console.error('Failed to send refund confirmation email:', emailErr.message);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/resolve-return — admin approves/rejects a return (refund) or exchange request
// Body: { approve: true|false }
router.put('/:id/resolve-return', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isExchange = order.status === 'exchange_requested';

    if (!req.body.approve) {
      order.status = 'completed';
      await order.save();
      return res.json(order);
    }

    if (isExchange) {
      // Exchanges don't refund money — admin handles shipping the replacement size manually
      order.status = 'exchanged';
      await order.save();
      return res.json(order);
    }

    // Refund-type return — same Stripe refund logic as cancellation
    if (order.paymentStatus === 'paid' && order.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
        order.paymentStatus = 'refunded';
      } catch (refundErr) {
        order.paymentStatus = 'refund_failed';
        await order.save();
        return res.status(500).json({ message: `Refund failed: ${refundErr.message}` });
      }
    }

    order.status = 'returned';
    await order.save();

    // Restore stock for any clothing items returned
    for (const item of order.items) {
      if (item.type === 'product' && item.size && item.itemId) {
        try {
          await Product.updateOne(
            { _id: item.itemId, 'sizes.size': item.size },
            { $inc: { 'sizes.$.stock': item.qty } }
          );
        } catch (stockErr) {
          console.error('Failed to restore stock:', stockErr.message);
        }
      }
    }

    if (order.paymentStatus === 'refunded' && order.user?.email) {
      try {
        await sendRefundConfirmationEmail({
          to: order.user.email, name: order.user.name, country: order.country,
          items: order.items, total: order.total, currency: order.currency,
          paymentIntentId: order.stripePaymentIntentId,
          siteUrl: `${process.env.CLIENT_URL}/account`,
        });
      } catch (emailErr) {
        console.error('Failed to send refund confirmation email:', emailErr.message);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/admin/stats
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allOrders = await Order.find({ paymentStatus: 'paid' }).populate('user', 'name username email').sort('-createdAt');
    const revenueOrders = allOrders.filter(o => !['cancelled', 'returned'].includes(o.status));

    const totalOrders = allOrders.length;
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);

    const thisMonthOrders = allOrders.filter(o => o.createdAt >= startOfMonth);
    const monthRevenueOrders = thisMonthOrders.filter(o => !['cancelled', 'returned'].includes(o.status));
    const monthOrders = thisMonthOrders.length;
    const monthRevenue = monthRevenueOrders.reduce((sum, o) => sum + o.total, 0);

    const aoOrders = allOrders.filter(o => o.country === 'ao');
    const ukOrders = allOrders.filter(o => o.country === 'uk');
    const aoRevenue = aoOrders.filter(o => !['cancelled', 'returned'].includes(o.status)).reduce((s, o) => s + o.total, 0);
    const ukRevenue = ukOrders.filter(o => !['cancelled', 'returned'].includes(o.status)).reduce((s, o) => s + o.total, 0);

    const cancelRequests = allOrders.filter(o => o.status === 'cancel_requested').length;
    const returnRequests = allOrders.filter(o => ['return_requested', 'exchange_requested'].includes(o.status)).length;

    const lineItems = [];
    allOrders.forEach(order => {
      order.items.forEach(item => {
        lineItems.push({
          orderId: order._id, type: item.type, name: item.name, price: item.price,
          currency: item.currency, qty: item.qty, image: item.image, size: item.size,
          status: order.status, country: order.country,
          customer: order.user ? { name: order.user.name, username: order.user.username, email: order.user.email } : null,
          date: order.createdAt,
        });
      });
    });

    const byType = {
      event:   lineItems.filter(i => i.type === 'event'),
      product: lineItems.filter(i => i.type === 'product'),
      service: lineItems.filter(i => i.type === 'service'),
      artist:  lineItems.filter(i => i.type === 'artist'),
    };

    res.json({
      totalOrders, totalRevenue, monthOrders, monthRevenue, cancelRequests, returnRequests,
      countryBreakdown: {
        ao: { orders: aoOrders.length, revenue: aoRevenue },
        uk: { orders: ukOrders.length, revenue: ukRevenue },
      },
      recentOrders: allOrders.slice(0, 10),
      byType,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;