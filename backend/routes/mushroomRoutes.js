const express = require('express');
const router = express.Router();
const Mushroom = require('../models/Mushroom');
const { protect } = require('../middleware/auth');

function normalizeText(s) {
  return String(s || '').trim();
}

function isGenericDescription(desc) {
  const d = normalizeText(desc).toLowerCase();
  if (!d) return true;
  if (d.length < 35) return true;
  if (d.includes('added to our cultivation supply store')) return true;
  if (d.includes('premium') && d.includes('added')) return true;
  return false;
}

function buildUsesForCategory(category) {
  const c = normalizeText(category).toLowerCase();
  if (c.includes('kit')) return ['Home cultivation', 'Beginner-friendly', 'Fast setup'];
  if (c.includes('supplies')) return ['Sterile workflow', 'Inoculation support', 'Contamination reduction'];
  if (c.includes('equipment')) return ['Climate control', 'Farm setup', 'Repeat use'];
  if (c.includes('service')) return ['Consultation', 'Setup support', 'Troubleshooting'];
  return ['Mushroom cultivation', 'Farm workflow', 'Educational demo'];
}

function suggestFairDetails(m) {
  const name = normalizeText(m?.name).toLowerCase();
  const category = normalizeText(m?.category);
  const uses = buildUsesForCategory(category);

  // Price suggestions in INR (best-effort defaults).
  let price = Number(m?.price) || 0;
  let suggestedPrice = price;

  if (name.includes('grow kit')) suggestedPrice = 1499;
  else if (name.includes('spore syringe')) suggestedPrice = 499;
  else if (name.includes('liquid culture')) suggestedPrice = 549;
  else if (name.includes('grain bag')) suggestedPrice = 399;
  else if (name.includes('substrate') || name.includes('cvg')) suggestedPrice = 449;
  else if (name.includes('spawn')) suggestedPrice = 299;
  else if (name.includes('straw')) suggestedPrice = 199;
  else if (name.includes('growing bags') || name.includes('poly bag')) suggestedPrice = 299;
  else if (name.includes('rack') || name.includes('shelves')) suggestedPrice = 2999;
  else if (name.includes('humidity sprayer')) suggestedPrice = 1499;
  else if (name.includes('meter') || name.includes('hygrometer')) suggestedPrice = 399;
  else if (name.includes('spray bottle')) suggestedPrice = 199;
  else if (name.includes('disinfectant') || name.includes('formalin')) suggestedPrice = 249;
  else if (name.includes('gloves') || name.includes('mask')) suggestedPrice = 199;
  else if (name.includes('drying tray')) suggestedPrice = 699;
  else if (name.includes('crates')) suggestedPrice = 499;
  else if (name.includes('packing covers')) suggestedPrice = 299;
  else if (name.includes('shade net') || name.includes('tent')) suggestedPrice = 1999;
  else {
    // category-based fallback
    const c = category.toLowerCase();
    if (c === 'kit') suggestedPrice = 1499;
    else if (c === 'equipment') suggestedPrice = 999;
    else if (c === 'supplies') suggestedPrice = 299;
    else suggestedPrice = 499;
  }

  // Description suggestions (kept short + ecommerce friendly).
  let suggestedDescription = normalizeText(m?.description);
  if (isGenericDescription(suggestedDescription)) {
    if (name.includes('grow kit')) {
      suggestedDescription = 'Complete starter grow kit with pre-colonized substrate, humidity support, and simple step-by-step use. Ideal for home growers.';
    } else if (name.includes('spore syringe')) {
      suggestedDescription = 'Sterile 10cc syringe prepared for clean inoculation workflows. Consistent quality, sealed packaging, and easy handling.';
    } else if (name.includes('liquid culture')) {
      suggestedDescription = 'Active liquid culture in a sterile syringe for quick inoculation. Designed for clean handling and consistent results.';
    } else if (name.includes('grain bag')) {
      suggestedDescription = 'Sterilized grain bag with injection port and filter patch for easy inoculation and strong colonization. Great for home setups.';
    } else if (name.includes('substrate') || name.includes('cvg')) {
      suggestedDescription = 'Ready-to-use substrate mix for fruiting and bulk grows. Balanced moisture performance and consistent texture for cultivation.';
    } else if (name.includes('rack') || name.includes('shelves')) {
      suggestedDescription = 'Sturdy shelving designed for organizing grow bags and trays. Space-saving layout for home labs and farm rooms.';
    } else if (name.includes('humidity sprayer')) {
      suggestedDescription = 'Timed misting sprayer to help maintain humidity. Useful for fruiting chambers, tents, and controlled grow areas.';
    } else if (name.includes('meter') || name.includes('hygrometer')) {
      suggestedDescription = 'Digital temperature and humidity meter for quick climate checks. Helps monitor and stabilize your grow environment.';
    } else {
      suggestedDescription = `Reliable ${normalizeText(m?.category) || 'mushroom'} item designed for cultivation workflows. Clean handling, practical use, and consistent performance.`;
    }
  }

  // Measure-based price suggestions (only if measures/prices exist).
  let suggestedPrices = null;
  const prices = m?.prices || null;
  const measures = Array.isArray(m?.measures) ? m.measures : [];
  if (prices && measures.length) {
    const out = {};
    for (const meas of measures) {
      const key = String(meas);
      // Try to keep relative ordering but move into INR-ish values.
      const base = suggestedPrice;
      if (/3\s*bag/i.test(key)) out[key] = Math.round(base * 2.4);
      else if (/5\s*lbs|5lb|5\s*kg/i.test(key)) out[key] = base;
      else if (/10\s*lbs|10lb|10\s*kg/i.test(key)) out[key] = Math.round(base * 1.7);
      else if (/100\s*pack/i.test(key)) out[key] = Math.round(base * 1.3);
      else if (/50\s*pack/i.test(key)) out[key] = base;
      else out[key] = base;
    }
    suggestedPrices = out;
  }

  return { suggestedPrice, suggestedDescription, suggestedUses: uses, suggestedPrices };
}

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

// Normalize product details (admin helper)
// @route POST /api/mushrooms/normalize
// @desc  Fill "fair" description/pricing/uses (best-effort). Use { force: true } to overwrite.
// @access Public (should be protected in production)
router.post('/normalize', async (req, res) => {
  try {
    const force = !!req.body?.force;
    const onlyIfMissing = !force;

    const all = await Mushroom.find({});
    let updated = 0;
    const changes = [];

    for (const m of all) {
      const { suggestedPrice, suggestedDescription, suggestedUses, suggestedPrices } = suggestFairDetails(m);
      const next = {};

      const currentPrice = Number(m.price) || 0;
      if (force || currentPrice <= 0 || (onlyIfMissing && currentPrice < 50)) next.price = suggestedPrice;

      if (force || isGenericDescription(m.description)) next.description = suggestedDescription;

      const currentUses = Array.isArray(m.uses) ? m.uses.filter(Boolean) : [];
      if (force || currentUses.length === 0) next.uses = suggestedUses;

      // Update measure-based prices if force, otherwise keep user's edits.
      if (force && suggestedPrices) next.prices = suggestedPrices;

      if (Object.keys(next).length) {
        await Mushroom.updateOne({ _id: m._id }, { $set: next });
        updated += 1;
        changes.push({ id: m._id, name: m.name, updatedFields: Object.keys(next) });
      }
    }

    res.json({ success: true, message: 'Normalization complete', data: { updated, total: all.length, changes } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Normalization failed', error: error.message });
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

// POST create review
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const mushroom = await Mushroom.findById(req.params.id);

    if (!mushroom) {
      return res.status(404).json({ success: false, message: 'Mushroom not found' });
    }

    const review = {
      user: req.user.name,
      rating: Number(rating),
      comment,
      date: Date.now()
    };

    mushroom.reviews.push(review);
    
    if (mushroom.reviews.length > 0) {
      mushroom.rating = mushroom.reviews.reduce((acc, item) => item.rating + acc, 0) / mushroom.reviews.length;
    }

    await mushroom.save();
    res.status(201).json({ success: true, message: 'Review added successfully', data: mushroom });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
