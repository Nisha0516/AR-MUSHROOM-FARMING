const mongoose = require('mongoose');

const mushroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mushroom name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  type: {
    type: String,
    enum: ['produce', 'service', 'product'],
    default: 'produce'
  },
  measures: {
    type: [String],
    default: []
  },
  prices: {
    type: Map,
    of: Number,
    default: {}
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Button', 'Portobello', 'Shiitake', 'Oyster', 'Cremini', 'Enoki', 'Kit', 'Service', 'Supplies', 'Equipment', 'Other']
  },
  image: {
    type: String,
    default: 'default-mushroom.jpg'
  },
  modelUrl: {
    type: String,
    trim: true,
    default: ''
  },
  iosModelUrl: {
    type: String,
    trim: true,
    default: ''
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mushroom', mushroomSchema);
