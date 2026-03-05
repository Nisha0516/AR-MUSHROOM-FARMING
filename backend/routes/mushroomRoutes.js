const express = require('express');
const router = express.Router();
const Mushroom = require('../models/Mushroom');

// GET all mushrooms
router.get('/', async (req, res) => {
  try {
    const mushrooms = await Mushroom.find({ isAvailable: true });
    res.json({
      success: true,
      count: mushrooms.length,
      data: mushrooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mushrooms',
      error: error.message
    });
  }
});

// GET single mushroom
router.get('/:id', async (req, res) => {
  try {
    const mushroom = await Mushroom.findById(req.params.id);
    if (!mushroom) {
      return res.status(404).json({
        success: false,
        message: 'Mushroom not found'
      });
    }
    res.json({
      success: true,
      data: mushroom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mushroom',
      error: error.message
    });
  }
});

// CREATE new mushroom
router.post('/', async (req, res) => {
  try {
    const mushroom = await Mushroom.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Mushroom created successfully',
      data: mushroom
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating mushroom',
      error: error.message
    });
  }
});

// UPDATE mushroom
router.put('/:id', async (req, res) => {
  try {
    const mushroom = await Mushroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!mushroom) {
      return res.status(404).json({
        success: false,
        message: 'Mushroom not found'
      });
    }
    res.json({
      success: true,
      message: 'Mushroom updated successfully',
      data: mushroom
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating mushroom',
      error: error.message
    });
  }
});

// DELETE mushroom
router.delete('/:id', async (req, res) => {
  try {
    const mushroom = await Mushroom.findByIdAndDelete(req.params.id);
    if (!mushroom) {
      return res.status(404).json({
        success: false,
        message: 'Mushroom not found'
      });
    }
    res.json({
      success: true,
      message: 'Mushroom deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting mushroom',
      error: error.message
    });
  }
});

// GET mushrooms by category
router.get('/category/:category', async (req, res) => {
  try {
    const mushrooms = await Mushroom.find({ 
      category: req.params.category,
      isAvailable: true 
    });
    res.json({
      success: true,
      count: mushrooms.length,
      data: mushrooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mushrooms by category',
      error: error.message
    });
  }
});

module.exports = router;
