const express = require('express');
const ArMushroom = require('../models/ArMushroom');
const ArScan = require('../models/ArScan');

const router = express.Router();

function randomBetween(min, max, decimals = 0) {
  const val = min + Math.random() * (max - min);
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

function randomInt(min, max) {
  return Math.round(randomBetween(min, max, 0));
}

function normalizeMarkerKey(rawValue) {
  const v = String(rawValue || '').trim();
  if (!v) return '';
  const upper = v.toUpperCase();
  if (upper.startsWith('MUSHROOM:')) return upper.slice('MUSHROOM:'.length).trim().toLowerCase();
  return v.toLowerCase();
}

router.get('/mushrooms', async (req, res) => {
  try {
    const items = await ArMushroom.find({}).sort({ markerKey: 1 }).lean();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load AR mushrooms' });
  }
});

router.get('/mushrooms/:markerKey', async (req, res) => {
  try {
    const markerKey = normalizeMarkerKey(req.params.markerKey);
    const item = await ArMushroom.findOne({ markerKey }).lean();
    if (!item) return res.status(404).json({ success: false, message: 'Marker not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load marker' });
  }
});

// Create a new AR mushroom marker (admin UI)
router.post('/mushrooms', async (req, res) => {
  try {
    const body = req.body || {};
    const markerKey = normalizeMarkerKey(body.markerKey);
    if (!markerKey) return res.status(400).json({ success: false, message: 'markerKey is required' });

    const payload = {
      markerKey,
      name: String(body.name || '').trim(),
      typeLabel: String(body.typeLabel || '').trim(),
      safety: body.safety === 'not_safe' ? 'not_safe' : 'safe',
      image: String(body.image || '').trim(),
      benefits: Array.isArray(body.benefits) ? body.benefits.map((x) => String(x).trim()).filter(Boolean) : [],
      sketchfabEmbedUrl: String(body.sketchfabEmbedUrl || '').trim(),
      modelSrc: String(body.modelSrc || '').trim(),
      nutrientRanges: body.nutrientRanges || null
    };

    if (!payload.name) return res.status(400).json({ success: false, message: 'name is required' });
    if (!payload.typeLabel) return res.status(400).json({ success: false, message: 'typeLabel is required' });
    if (!payload.nutrientRanges) return res.status(400).json({ success: false, message: 'nutrientRanges is required' });

    const created = await ArMushroom.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    // Duplicate markerKey
    if (e && e.code === 11000) {
      return res.status(409).json({ success: false, message: 'markerKey already exists' });
    }
    res.status(400).json({ success: false, message: 'Failed to create AR mushroom', error: e?.message });
  }
});

// Update an existing AR mushroom marker (admin UI)
router.put('/mushrooms/:markerKey', async (req, res) => {
  try {
    const markerKey = normalizeMarkerKey(req.params.markerKey);
    if (!markerKey) return res.status(400).json({ success: false, message: 'markerKey is required' });

    const body = req.body || {};
    const update = {};

    if (typeof body.name === 'string') update.name = body.name.trim();
    if (typeof body.typeLabel === 'string') update.typeLabel = body.typeLabel.trim();
    if (typeof body.safety === 'string') update.safety = body.safety === 'not_safe' ? 'not_safe' : 'safe';
    if (typeof body.image === 'string') update.image = body.image.trim();
    if (Array.isArray(body.benefits)) update.benefits = body.benefits.map((x) => String(x).trim()).filter(Boolean);
    if (typeof body.sketchfabEmbedUrl === 'string') update.sketchfabEmbedUrl = body.sketchfabEmbedUrl.trim();
    if (typeof body.modelSrc === 'string') update.modelSrc = body.modelSrc.trim();
    if (body.nutrientRanges) update.nutrientRanges = body.nutrientRanges;

    const updated = await ArMushroom.findOneAndUpdate({ markerKey }, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Marker not found' });

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to update AR mushroom', error: e?.message });
  }
});

// Delete an AR mushroom marker (admin UI)
router.delete('/mushrooms/:markerKey', async (req, res) => {
  try {
    const markerKey = normalizeMarkerKey(req.params.markerKey);
    if (!markerKey) return res.status(400).json({ success: false, message: 'markerKey is required' });

    const deleted = await ArMushroom.findOneAndDelete({ markerKey });
    if (!deleted) return res.status(404).json({ success: false, message: 'Marker not found' });

    res.json({ success: true, message: 'Deleted', data: deleted });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete marker' });
  }
});

// View recent scans (debug / admin-friendly)
router.get('/scans', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(5000, Number(req.query?.limit || 20) || 20));
    const days = Number(req.query?.days || 0) || 0;
    const q = {};
    if (days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      q.createdAt = { $gte: since };
    }

    const items = await ArScan.find(q)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('mushroom')
      .lean();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load scans' });
  }
});

// Analytics endpoint (admin UI)
router.get('/analytics', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query?.days || 30) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [daily, sources, top] = await Promise.all([
      ArScan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      ArScan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ArScan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$markerKey', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const total = daily.reduce((sum, d) => sum + (d.count || 0), 0);

    // Attach names for top markers (best-effort)
    const topKeys = top.map((t) => t._id).filter(Boolean);
    const topDocs = await ArMushroom.find({ markerKey: { $in: topKeys } }).lean();
    const nameMap = {};
    for (const m of topDocs) nameMap[m.markerKey] = m.name;

    res.json({
      success: true,
      data: {
        days,
        totalScans: total,
        dailyCounts: daily.map((d) => ({ date: d._id, count: d.count })),
        sourceBreakdown: sources.map((s) => ({ source: s._id || 'unknown', count: s.count })),
        topMushrooms: top.map((t) => ({ markerKey: t._id || 'unknown', name: nameMap[t._id] || t._id, count: t.count }))
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to build analytics' });
  }
});

// Scan endpoint: returns mushroom details + randomized nutrients, and stores scan in DB.
router.post('/scan', async (req, res) => {
  try {
    const markerKey = normalizeMarkerKey(req.body?.markerKey || req.body?.rawValue);
    const confidencePct = typeof req.body?.confidencePct === 'number' ? req.body.confidencePct : null;
    const source = req.body?.source || 'marker';

    if (!markerKey) return res.status(400).json({ success: false, message: 'markerKey is required' });

    const mushroom = await ArMushroom.findOne({ markerKey });
    if (!mushroom) return res.status(404).json({ success: false, message: 'Marker not found' });

    const r = mushroom.nutrientRanges;
    const nutrients = {
      proteinG: randomBetween(r.proteinG.min, r.proteinG.max, 1),
      fiberG: randomBetween(r.fiberG.min, r.fiberG.max, 1),
      vitaminDDV: randomInt(r.vitaminDDV.min, r.vitaminDDV.max),
      potassiumMg: randomInt(r.potassiumMg.min, r.potassiumMg.max)
    };

    const scan = await ArScan.create({
      markerKey,
      mushroom: mushroom._id,
      confidencePct,
      source,
      nutrients
    });

    res.json({
      success: true,
      data: {
        markerKey: mushroom.markerKey,
        name: mushroom.name,
        typeLabel: mushroom.typeLabel,
        safety: mushroom.safety,
        image: mushroom.image,
        benefits: mushroom.benefits,
        sketchfabEmbedUrl: mushroom.sketchfabEmbedUrl,
        modelSrc: mushroom.modelSrc,
        nutrients,
        confidencePct,
        scanId: scan._id
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Scan failed' });
  }
});

module.exports = router;
