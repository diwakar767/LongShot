const express = require('express');
const { Country } = require('../models/country');
const { Application } = require('../models/application');
const { Server } = require('../models/server');
const { Alert } = require('../models/alert');
const { UserGroup } = require('../models/user_group');
const { authenticateToken, authenticateAlertIngest } = require('../middleware/auth');
const {
  getServerIdByName,
  getAppIdByName,
  getGroupIdByName,
  getCountryIdByName
} = require('../services/resolveNames');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      include: [
        { model: Server, attributes: ['server_name', 'ip_address'] },
        { model: UserGroup, attributes: ['group_name'] },
        { model: Application, attributes: ['app_name'] },
        { model: Country, attributes: ['country_name'] }
      ]
    });
    const formattedAlerts = alerts.map(alert => ({
      id: alert.alert_id,
      message: alert.message,
      severity: alert.severity,
      country: alert.Country?.country_name || 'Unknown',
      server: alert.Server?.server_name || 'Unknown',
      serverIp: alert.Server?.ip_address || 'Unknown',
      app: alert.Application?.app_name || 'Unknown',
      group: alert.UserGroup?.group_name || 'Unknown',
      timestamp: alert.updatedAt
    }));
    res.json(formattedAlerts);
  } catch (error) {
    logger.error('fetch_alerts_error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.post('/alert', authenticateAlertIngest, async (req, res) => {
  try {
    let { message, severity, server_name, group_name, app_name, country_name } = req.body;
    message = message || 'Default alert message';
    severity = severity || 'minor';
    server_name = server_name || 'cli1-server';
    group_name = group_name || 'techops';
    app_name = app_name || 'monitor';
    country_name = country_name || 'United States';

    if (!['trivial', 'minor', 'major', 'critical'].includes(severity)) {
      throw new Error('Invalid severity level. Use trivial, minor, major, or critical.');
    }

    const server_id = await getServerIdByName(server_name);
    const app_id = await getAppIdByName(app_name);
    const country_id = await getCountryIdByName(country_name);
    const group_id = await getGroupIdByName(group_name);

    await Alert.create({ message, severity, server_id, group_id, app_id, country_id });
    logger.info('alert_ingested', { severity, server_name });
    res.status(200).json({ status: 'Alert received' });
  } catch (error) {
    logger.error('alert_ingest_error', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
