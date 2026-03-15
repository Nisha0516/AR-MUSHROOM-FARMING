const mongoose = require('mongoose');

const rangeSchema = new mongoose.Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  { _id: false }
);

const arMushroomSchema = new mongoose.Schema(
  {
    markerKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: { type: String, required: true, trim: true },
    typeLabel: { type: String, required: true, trim: true },
    safety: { type: String, enum: ['safe', 'not_safe'], required: true },
    image: { type: String, default: '' }, // e.g. /uploads/mush-11.jpg
    benefits: { type: [String], default: [] },

    // 3D sources (optional)
    sketchfabEmbedUrl: { type: String, default: '' },
    modelSrc: { type: String, default: '' },

    // Demo nutrition ranges (used to randomize per scan)
    nutrientRanges: {
      proteinG: { type: rangeSchema, required: true },
      fiberG: { type: rangeSchema, required: true },
      vitaminDDV: { type: rangeSchema, required: true },
      potassiumMg: { type: rangeSchema, required: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ArMushroom', arMushroomSchema);

