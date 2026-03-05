const mongoose = require('mongoose');
const Mushroom = require('../models/Mushroom');
const sampleData = require('./sampleData');

const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingCount = await Mushroom.countDocuments();
    
    if (existingCount === 0) {
      console.log('Seeding database with sample mushrooms...');
      await Mushroom.insertMany(sampleData);
      console.log(`✅ Successfully added ${sampleData.length} mushrooms to database`);
    } else {
      console.log(`ℹ️  Database already contains ${existingCount} mushrooms, skipping seed`);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = seedDatabase;
