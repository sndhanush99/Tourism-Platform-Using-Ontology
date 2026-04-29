const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const villageRoutes = require('./routes/villages');
const bookingRoutes = require('./routes/bookings');
const marketplaceRoutes = require('./routes/marketplace');
const chatbotRoutes = require('./routes/chatbot');
const routeFinderRoutes = require('./routes/routeFinder');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/uploads');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/route-finder', routeFinderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Village State API running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// Connect DB and start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
