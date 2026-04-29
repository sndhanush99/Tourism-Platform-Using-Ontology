const express = require('express');
const User = require('../models/User');
const Village = require('../models/Village');
const Booking = require('../models/Booking');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// GET /api/admin/dashboard — stats
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalVillages, pendingVillages, totalBookings, revenueData] = await Promise.all([
      User.countDocuments(),
      Village.countDocuments({ status: 'verified' }),
      Village.countDocuments({ status: 'pending' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalVillages,
        pendingVillages,
        totalBookings,
        platformRevenue: revenueData[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/villages/pending
router.get('/villages/pending', async (req, res) => {
  try {
    const villages = await Village.find({ status: 'pending' })
      .populate('host', 'name email phone aadhaarNumber')
      .sort('createdAt');
    res.json({ success: true, villages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/villages/:id/verify
router.put('/villages/:id/verify', async (req, res) => {
  try {
    const { status, adminNote } = req.body; // status: verified | rejected
    const village = await Village.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('host', 'name email');
    if (!village) return res.status(404).json({ success: false, message: 'Village not found' });
    res.json({ success: true, village });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: false }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tourist', 'name email')
      .populate('village', 'name state')
      .sort('-createdAt')
      .limit(100);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
