const express = require('express');
const { Alert } = require('../models/alert');
const { Server } = require('../models/server');
const { User } = require('../models/user');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const [alertCount, serverCount, userCount] = await Promise.all([
      Alert.count(),
      Server.count({ where: { is_active: true } }),
      User.count({ where: { is_active: true } })
    ]);
    res.json({ alerts: alertCount, servers: serverCount, users: userCount });
  } catch (error) {
    logger.error('dashboard_summary_error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
