const express = require('express');
const Product = require('../models/Product');
const { auth, hostOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/marketplace
router.get('/', async (req, res) => {
  try {
    const { category, isService, search } = req.query;
    let query = { isAvailable: true };
    if (category) query.category = category;
    if (isService !== undefined) query.isService = isService === 'true';
    if (search) query.name = new RegExp(search, 'i');

    const products = await Product.find(query)
      .populate('seller', 'name avatar')
      .populate('village', 'name state')
      .sort('-createdAt');
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/marketplace/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name avatar phone')
      .populate('village', 'name state district');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/marketplace — host adds product/service
router.post('/', auth, hostOnly, async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/marketplace/:id
router.put('/:id', auth, hostOnly, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/marketplace/:id
router.delete('/:id', auth, hostOnly, async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
