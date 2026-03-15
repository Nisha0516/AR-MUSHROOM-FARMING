const Mushroom = require('../models/Mushroom');
const User = require('../models/User');
const sampleData = require('./sampleData');

const ArMushroom = require('../models/ArMushroom');
const arSampleData = require('./arSampleData');

const seedDatabase = async () => {
  try {
    // IMPORTANT:
    // We seed multiple collections (products + AR markers). Do not early-return based on only one collection.

    // Seed Guest User (idempotent)
    const guestEmail = 'guest@ar-matrix.com';
    const existingGuest = await User.findOne({ email: guestEmail }).lean();
    if (!existingGuest) {
      console.log('Seeding Guest User...');
      await User.create({
        name: 'Guest User',
        email: guestEmail,
        password: 'password123',
        role: 'user'
      });
    }

    // Seed product mushrooms only if empty (preserves edits/admin changes)
    const productCount = await Mushroom.countDocuments();
    if (productCount === 0) {
      console.log('Seeding database with enterprise product data...');
      await Mushroom.insertMany(sampleData);
      console.log(`OK: Successfully added ${sampleData.length} products to database`);
    } else {
      console.log(`OK: Database already has ${productCount} products. Skipping product seed.`);
    }

    // Seed AR marker mushrooms only if empty (used by /scan-mushroom + /mushroom-markers)
    const arCount = await ArMushroom.countDocuments();
    if (arCount === 0) {
      console.log('Seeding AR mushroom marker data...');
      await ArMushroom.insertMany(arSampleData);
      console.log(`OK: Successfully added ${arSampleData.length} AR marker mushrooms`);
    } else {
      console.log(`OK: Database already has ${arCount} AR marker mushrooms. Skipping AR seed.`);
    }
  } catch (error) {
    console.error('ERROR: Error seeding database:', error);
  }
};

module.exports = seedDatabase;
