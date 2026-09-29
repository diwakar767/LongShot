const express = require('express');
const { Country } = require('../models/country');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/countries', authenticateToken, async (req, res) => {
  try {
    const countries = await Country.findAll();
    res.json(countries);
  } catch (error) {
    logger.error('fetch_countries_error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

module.exports = router;
