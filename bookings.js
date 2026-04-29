const express = require('express');
const Booking = require('../models/Booking');
const Village = require('../models/Village');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — create booking
router.post('/', auth, async (req, res) => {
  try {
    const { villageId, stayOption, checkIn, checkOut, guests, specialRequests } = req.body;

    const village = await Village.findById(villageId);
    if (!village || village.status !== 'verified') {
      return res.status(404).json({ success: false, message: 'Village not available' });
    }

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalAmount = stayOption.pricePerNight * nights;

    const booking = await Booking.create({
      tourist: req.user._id,
      host: village.host,
      village: villageId,
      stayOption,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      specialRequests
    });

    await booking.populate(['tourist', 'village', 'host']);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/my — tourist's bookings
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ tourist: req.user._id })
      .populate('village', 'name images state district')
      .populate('host', 'name phone')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/host — host's incoming bookings
router.get('/host', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate('tourist', 'name phone email avatar')
      .populate('village', 'name')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('village')
      .populate('tourist', 'name email phone')
      .populate('host', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/status — host confirms/cancels
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, host: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    if (cancellationReason) booking.cancellationReason = cancellationReason;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/cancel — tourist cancels
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tourist: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'completed') return res.status(400).json({ success: false, message: 'Cannot cancel completed booking' });

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason;
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
