const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

// Get traffic overview
router.get('/traffic', auth, isAdmin, async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    const data = await analyticsService.getTrafficOverview(range);
    res.json(data);
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get quick stats
router.get('/quick-stats', auth, isAdmin, async (req, res) => {
  try {
    const stats = await analyticsService.getQuickStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get complete dashboard stats
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    const [traffic, quickStats] = await Promise.all([
      analyticsService.getTrafficOverview('week'),
      analyticsService.getQuickStats()
    ]);

    res.json({
      traffic,
      quickStats
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;