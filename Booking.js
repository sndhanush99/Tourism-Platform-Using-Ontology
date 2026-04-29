const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village', required: true },
  stayOption: {
    title: String,
    pricePerNight: Number,
    maxGuests: Number
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalNights: { type: Number },
  totalAmount: { type: Number, required: true },
  platformFee: { type: Number },
  hostEarnings: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['stripe', 'upi_qr', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending_verification', 'paid', 'refunded'],
    default: 'unpaid'
  },
  // Stripe
  stripePaymentIntentId: { type: String },
  stripeChargeId: { type: String },
  // UPI / QR payment
  upiTransactionId: { type: String },       // tourist enters this after paying
  upiTransactionScreenshot: { type: String }, // tourist uploads screenshot (optional)
  upiVerifiedByHost: { type: Boolean, default: false },
  upiVerifiedAt: { type: Date },
  upiRejectionReason: { type: String },
  // Additional
  specialRequests: { type: String },
  cancellationReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const msPerDay = 1000 * 60 * 60 * 24;
    this.totalNights = Math.ceil((this.checkOut - this.checkIn) / msPerDay);
    this.platformFee = Math.round(this.totalAmount * 0.1);
    this.hostEarnings = this.totalAmount - this.platformFee;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
