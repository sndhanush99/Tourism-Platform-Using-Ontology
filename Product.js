const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['handicraft', 'organic_food', 'textiles', 'pottery', 'jewellery', 'art', 'spices', 'other'],
    required: true
  },
  price: { type: Number, required: true },
  stock: { type: Number, default: 1 },
  images: [String],
  isAvailable: { type: Boolean, default: true },
  // Local services
  isService: { type: Boolean, default: false },
  serviceType: { type: String, enum: ['guide', 'cultural_event', 'cooking_class', 'farm_tour', 'other'] },
  serviceDuration: { type: String },
  orders: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
