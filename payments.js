const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ── Stripe: create payment intent ──────────────────────────────────────────
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.tourist.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: 'inr',
      metadata: { bookingId: bookingId.toString(), userId: req.user._id.toString() }
    });

    booking.stripePaymentIntentId = paymentIntent.id;
    booking.paymentMethod = 'stripe';
    await booking.save();

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Stripe: confirm after success ──────────────────────────────────────────
router.post('/confirm', auth, async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded')
      return res.status(400).json({ success: false, message: 'Payment not completed' });

    const booking = await Booking.findByIdAndUpdate(bookingId,
      { paymentStatus: 'paid', status: 'confirmed', paymentMethod: 'stripe' },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── UPI QR: tourist submits transaction ID ──────────────────────────────────
router.post('/upi-submit', auth, async (req, res) => {
  try {
    const { bookingId, upiTransactionId, upiTransactionScreenshot } = req.body;

    if (!upiTransactionId?.trim())
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.tourist.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    booking.upiTransactionId = upiTransactionId.trim();
    if (upiTransactionScreenshot) booking.upiTransactionScreenshot = upiTransactionScreenshot;
    booking.paymentMethod = 'upi_qr';
    booking.paymentStatus = 'pending_verification';
    booking.status = 'pending';
    await booking.save();

    await booking.populate(['tourist', 'village', 'host']);
    res.json({ success: true, booking, message: 'Transaction ID submitted. Host will verify and confirm your booking.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── UPI QR: host verifies transaction ──────────────────────────────────────
router.post('/upi-verify', auth, async (req, res) => {
  try {
    const { bookingId, action, rejectionReason } = req.body;
    // action: 'approve' | 'reject'

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.host.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only the host can verify payments' });

    if (action === 'approve') {
      booking.upiVerifiedByHost = true;
      booking.upiVerifiedAt = new Date();
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
    } else {
      booking.upiVerifiedByHost = false;
      booking.upiRejectionReason = rejectionReason || 'Transaction ID not found';
      booking.paymentStatus = 'unpaid';
      booking.status = 'pending';
      booking.upiTransactionId = null;
    }

    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Get Stripe publishable key ─────────────────────────────────────────────
router.get('/publishable-key', (req, res) => {
  res.json({ success: true, key: process.env.STRIPE_PUBLISHABLE_KEY });
});

module.exports = router;
