const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  pincode: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  images: [String],        // village-level photos
  videos: [String],
  paymentQrCode: { type: String },
  upiId: { type: String },
  stayOptions: [{
    title: String,
    description: String,
    pricePerNight: Number,
    maxGuests: Number,
    amenities: [String],
    images: [String]       // per-stay photos
  }],
  activities: [{ name: String, description: String, price: Number }],
  festivals: [{ name: String, month: String, description: String }],
  localFood: [String],
  languages: [String],
  status: { type: String, enum: ['pending', 'verified', 'rejected', 'suspended'], default: 'pending' },
  adminNote: { type: String },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  safetyInfo: { type: String },
  nearestHospital: { type: String },
  nearestPoliceStation: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

villageSchema.index({ location: '2dsphere' });
villageSchema.index({ state: 1, status: 1 });

module.exports = mongoose.model('Village', villageSchema);
