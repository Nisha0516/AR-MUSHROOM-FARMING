const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// @route   POST /api/inquiries
// @desc    Submit a new contact inquiry
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;

        if (!name || !email || !service || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const inquiry = await Inquiry.create({
            name,
            email,
            phone,
            service,
            message
        });

        res.status(201).json({
            success: true,
            data: inquiry,
            message: 'Inquiry submitted successfully'
        });
    } catch (error) {
        console.error('Inquiry Creation Error:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting inquiry' });
    }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries
// @access  Public (Should be protected for Admin in production)
router.get('/', async (req, res) => {
    try {
        const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        console.error('Fetch Inquiries Error:', error);
        res.status(500).json({ success: false, message: 'Server Error retrieving inquiries' });
    }
});

// @route   PUT /api/inquiries/:id/status
// @desc    Update inquiry status
// @access  Public (Should be protected for Admin in production)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['New', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        res.json({
            success: true,
            data: inquiry,
            message: 'Inquiry status updated successfully'
        });
    } catch (error) {
        console.error('Update Inquiry Error:', error);
        res.status(500).json({ success: false, message: 'Server Error updating inquiry' });
    }
});

module.exports = router;
