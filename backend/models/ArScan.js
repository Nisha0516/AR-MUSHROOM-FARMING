const mongoose = require('mongoose');

const arScanSchema = new mongoose.Schema(
  {
    markerKey: { type: String, required: true, trim: true, lowercase: true },
    mushroom: { type: mongoose.Schema.Types.ObjectId, ref: 'ArMushroom' },
    confidencePct: { type: Number, default: null },
    source: { type: String, default: 'marker' }, // marker | ai | fallback
    nutrients: {
      proteinG: Number,
      fiberG: Number,
      vitaminDDV: Number,
      potassiumMg: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ArScan', arScanSchema);

