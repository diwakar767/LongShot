const express = require('express');
const { Country } = require('../models/country');
const { Application } = require('../models/application');
const { Server } = require('../models/server');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/servers', authenticateToken, async (req, res) => {
  try {
    const servers = await Server.findAll({
      include: [
        { model: Country, attributes: ['country_name'] },
        { model: Application, attributes: ['app_name'] }
      ]
    });
    const formattedServers = servers.map(server => ({
      id: server.server_id,
      name: server.server_name,
      ip: server.ip_address,
      country: server.Country?.country_name || 'Unknown',
      app: server.Application?.app_name || 'Unknown',
      is_active: server.is_active
    }));
    res.json(formattedServers);
  } catch (error) {
    logger.error('fetch_servers_error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

router.post('/servers', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { server_name, ip_address, country_name, app_name } = req.body;
    if (!server_name) return res.status(400).json({ error: 'Server name is required' });

    const country = country_name ? await Country.findOne({ where: { country_name } }) : null;
    const app = app_name ? await Application.findOne({ where: { app_name } }) : null;

    const server = await Server.create({
      server_name,
      ip_address,
      country_id: country?.country_id || null,
      app_id: app?.app_id || null
    });
    res.status(201).json({
      id: server.server_id,
      name: server.server_name,
      ip: server.ip_address,
      country: country?.country_name || 'Unknown',
      app: app?.app_name || 'Unknown',
      is_active: server.is_active
    });
  } catch (error) {
    logger.error('create_server_error', { error: error.message });
    res.status(500).json({ error: 'Failed to create server' });
  }
});

router.put('/servers/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { server_name, ip_address, country_name, app_name } = req.body;
    const server = await Server.findByPk(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });

    const country = country_name ? await Country.findOne({ where: { country_name } }) : null;
    const app = app_name ? await Application.findOne({ where: { app_name } }) : null;

    await server.update({
      server_name: server_name || server.server_name,
      ip_address: ip_address || server.ip_address,
      country_id: country ? country.country_id : server.country_id,
      app_id: app ? app.app_id : server.app_id
    });

    const updatedServer = await Server.findByPk(req.params.id, {
      include: [
        { model: Country, attributes: ['country_name'] },
        { model: Application, attributes: ['app_name'] }
      ]
    });
    res.json({
      id: updatedServer.server_id,
      name: updatedServer.server_name,
      ip: updatedServer.ip_address,
      country: updatedServer.Country?.country_name || 'Unknown',
      app: updatedServer.Application?.app_name || 'Unknown',
      is_active: updatedServer.is_active
    });
  } catch (error) {
    logger.error('update_server_error', { error: error.message });
    res.status(500).json({ error: 'Failed to update server' });
  }
});

router.delete('/servers/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    await server.destroy();
    res.json({ message: 'Server deleted' });
  } catch (error) {
    logger.error('delete_server_error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete server' });
  }
});

module.exports = router;
