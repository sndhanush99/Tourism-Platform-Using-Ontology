const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Ensure upload dirs exist
const dirs = ['uploads/images', 'uploads/videos', 'uploads/qrcodes', 'uploads/screenshots'];
dirs.forEach(d => {
  const full = path.join(__dirname, '..', d);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mime = file.mimetype;
    let folder = 'uploads/images';
    if (mime.startsWith('video/')) folder = 'uploads/videos';
    else if (req.path.includes('qr')) folder = 'uploads/qrcodes';
    else if (req.path.includes('screenshot')) folder = 'uploads/screenshots';
    cb(null, path.join(__dirname, '..', folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 8)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Only images and videos allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/uploads/images — up to 10 village images
router.post('/images', auth, upload.array('images', 10), (req, res) => {
  const urls = req.files.map(f => `/uploads/images/${f.filename}`);
  res.json({ success: true, urls });
});

// POST /api/uploads/video — single village video
router.post('/video', auth, upload.single('video'), (req, res) => {
  res.json({ success: true, url: `/uploads/videos/${req.file.filename}` });
});

// POST /api/uploads/qrcode — host uploads their UPI QR code image
router.post('/qrcode', auth, upload.single('qrcode'), (req, res) => {
  res.json({ success: true, url: `/uploads/qrcodes/${req.file.filename}` });
});

// POST /api/uploads/screenshot — tourist uploads payment screenshot
router.post('/screenshot', auth, upload.single('screenshot'), (req, res) => {
  res.json({ success: true, url: `/uploads/screenshots/${req.file.filename}` });
});

module.exports = router;
