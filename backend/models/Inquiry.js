const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
        },
        phone: {
            type: String,
        },
        service: {
            type: String,
            required: [true, 'Please select a service'],
        },
        message: {
            type: String,
            required: [true, 'Please add a message'],
        },
        status: {
            type: String,
            enum: ['New', 'In Progress', 'Resolved'],
            default: 'New',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
