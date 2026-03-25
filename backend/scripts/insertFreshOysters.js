const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Mushroom = require('../models/Mushroom');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mushroom_farm';

const freshOysters = [
  {
    name: 'Fresh Oyster - 250g',
    description: 'Freshly harvested oyster mushrooms — packed and ready for sale. Grown locally with care.',
    price: 199,
    category: 'Oyster',
    type: 'produce',
    image: '/uploads/mush-14.jpg',
    rating: 4.8,
    stock: 120,
    isAvailable: true
  },
  {
    name: 'Fresh Oyster - 500g',
    description: 'Half-kilo pack of fresh oyster mushrooms — ideal for restaurants and bulk buyers.',
    price: 349,
    category: 'Oyster',
    type: 'produce',
    image: '/uploads/mush-13.jpg',
    rating: 4.9,
    stock: 80,
    isAvailable: true
  },
  {
    name: 'Fresh Oyster - Mixed Pack (250g x 2)',
    description: 'Two 250g packs in one mixed bundle — great value and freshness guaranteed.',
    price: 349,
    category: 'Oyster',
    type: 'produce',
    image: '/uploads/mush-12.jpg',
    rating: 4.9,
    stock: 60,
    isAvailable: true
  }
];

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const res = await Mushroom.insertMany(freshOysters);
    console.log(`Inserted ${res.length} fresh oyster products.`);
    process.exit(0);
  } catch (err) {
    console.error('Error inserting fresh oysters:', err);
    process.exit(1);
  }
})();
