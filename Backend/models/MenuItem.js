const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['thalis', 'starters', 'curries', 'breads', 'desserts', 'beverages'],
    default: 'thalis'
  },
  price: { type: Number, required: true },
  image: { type: String, default: '/assets/img/plate1.png' },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
