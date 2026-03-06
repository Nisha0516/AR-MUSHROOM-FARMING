const Mushroom = require('../models/Mushroom');
const User = require('../models/User');
const sampleData = require('./sampleData');

const seedDatabase = async () => {
  try {
    // Check if products already exist — if yes, skip seeding to preserve edits
    const existingCount = await Mushroom.countDocuments();
    if (existingCount > 0) {
      console.log(`✅ Database already has ${existingCount} products. Skipping seed.`);
      return;
    }

    console.log('🌱 Empty database detected. Running first-time seed...');

    console.log('Seeding Guest User...');
    await User.create({
      name: 'Guest User',
      email: 'guest@ar-matrix.com',
      password: 'password123',
      role: 'user'
    });

    console.log('Seeding database with enterprise data...');
    await Mushroom.insertMany(sampleData);
    console.log(`✅ Successfully added ${sampleData.length} products to database`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = seedDatabase;
