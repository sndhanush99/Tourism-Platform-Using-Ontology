const express = require('express');
const Village = require('../models/Village');
const { auth, hostOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/villages/host/my — MUST be before /:id
router.get('/host/my', auth, hostOnly, async (req, res) => {
  try {
    const villages = await Village.find({ host: req.user._id }).sort('-createdAt');
    res.json({ success: true, villages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/villages
router.get('/', async (req, res) => {
  try {
    const { state, search, lat, lng, radius = 50 } = req.query;
    let query = { status: 'verified', isActive: true };
    if (state) query.state = new RegExp(state, 'i');
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { district: new RegExp(search, 'i') },
      { state: new RegExp(search, 'i') }
    ];

    let villages;
    if (lat && lng) {
      villages = await Village.find({
        ...query,
        location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(radius) * 1000 } }
      }).populate('host', 'name avatar');
    } else {
      villages = await Village.find(query).populate('host', 'name avatar').sort('-createdAt');
    }
    res.json({ success: true, count: villages.length, villages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/villages/:id
router.get('/:id', async (req, res) => {
  try {
    const village = await Village.findById(req.params.id)
      .populate('host', 'name avatar phone email')
      .populate('reviews.user', 'name avatar');
    if (!village) return res.status(404).json({ success: false, message: 'Village not found' });
    res.json({ success: true, village });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/villages
router.post('/', auth, hostOnly, async (req, res) => {
  try {
    const village = await Village.create({ ...req.body, host: req.user._id });
    res.status(201).json({ success: true, village });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/villages/:id
router.put('/:id', auth, hostOnly, async (req, res) => {
  try {
    const village = await Village.findOne({ _id: req.params.id, host: req.user._id });
    if (!village) return res.status(404).json({ success: false, message: 'Not found or unauthorized' });
    Object.assign(village, req.body);
    await village.save();
    res.json({ success: true, village });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/villages/:id/review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const village = await Village.findById(req.params.id);
    if (!village) return res.status(404).json({ success: false, message: 'Village not found' });
    if (village.reviews.find(r => r.user.toString() === req.user._id.toString()))
      return res.status(400).json({ success: false, message: 'Already reviewed' });
    village.reviews.push({ user: req.user._id, rating, comment });
    village.totalReviews = village.reviews.length;
    village.averageRating = village.reviews.reduce((s, r) => s + r.rating, 0) / village.reviews.length;
    await village.save();
    res.json({ success: true, village });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
