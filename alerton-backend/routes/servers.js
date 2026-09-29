const express = require('express');
const { Country } = require('../models/country');
const { Application } = require('../models/application');
const { Server } = require('../models/server');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { agentStatusFromHeartbeat } = require('../services/agentStatus');
const { generateIngestApiKey } = require('../services/ingestKeys');
const { AuditLog } = require('../models/audit_log');
const logger = require('../utils/logger');

const router = express.Router();

function parseRetentionDays(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.floor(n);
}

function formatServer(server, { includeKey = false } = {}) {
  const agent_status = agentStatusFromHeartbeat(server.agent_last_heartbeat_at);
  const out = {
    id: server.server_id,
    name: server.server_name,
    ip: server.ip_address,
    country: server.Country?.country_name || 'Unknown',
    app: server.Application?.app_name || 'Unknown',
    is_active: server.is_active,
    retention_days: server.retention_days,
    agent_last_heartbeat_at: server.agent_last_heartbeat_at,
    agent_status,
    has_ingest_key: Boolean(server.ingest_api_key)
  };
  if (includeKey) {
    out.ingest_api_key = server.ingest_api_key || null;
  }
  return out;
}

router.get('/servers', authenticateToken, async (req, res) => {
  try {
    const servers = await Server.findAll({
      include: [
        { model: Country, attributes: ['country_name'] },
        { model: Application, attributes: ['app_name'] }
      ]
    });
    res.json(servers.map((s) => formatServer(s)));
  } catch (error) {
    logger.error('fetch_servers_error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

router.post('/servers', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { server_name, ip_address, country_name, app_name, retention_days } = req.body;
    if (!server_name) return res.status(400).json({ error: 'Server name is required' });

    const country = country_name ? await Country.findOne({ where: { country_name } }) : null;
    const app = app_name ? await Application.findOne({ where: { app_name } }) : null;
    const retention = parseRetentionDays(retention_days);
    const ingest_api_key = generateIngestApiKey();

    const server = await Server.create({
      server_name,
      ip_address,
      country_id: country?.country_id || null,
      app_id: app?.app_id || null,
      retention_days: retention === undefined ? null : retention,
      ingest_api_key
    });

    const created = await Server.findByPk(server.server_id, {
      include: [
        { model: Country, attributes: ['country_name'] },
        { model: Application, attributes: ['app_name'] }
      ]
    });
    // Return key once on create so admin can copy into CLI config
    res.status(201).json(formatServer(created, { includeKey: true }));
  } catch (error) {
    logger.error('create_server_error', { error: error.message });
    res.status(500).json({ error: 'Failed to create server' });
  }
});

router.put('/servers/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { server_name, ip_address, country_name, app_name, retention_days } = req.body;
    const server = await Server.findByPk(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });

    const country = country_name ? await Country.findOne({ where: { country_name } }) : null;
    const app = app_name ? await Application.findOne({ where: { app_name } }) : null;
    const retention = parseRetentionDays(retention_days);

    const patch = {
      server_name: server_name || server.server_name,
      ip_address: ip_address || server.ip_address,
      country_id: country ? country.country_id : server.country_id,
      app_id: app ? app.app_id : server.app_id
    };
    if (retention !== undefined) patch.retention_days = retention;

    await server.update(patch);

    const updatedServer = await Server.findByPk(req.params.id, {
      include: [
        { model: Country, attributes: ['country_name'] },
        { model: Application, attributes: ['app_name'] }
      ]
    });
    res.json(formatServer(updatedServer));
  } catch (error) {
    logger.error('update_server_error', { error: error.message });
    res.status(500).json({ error: 'Failed to update server' });
  }
});

/** Admin: reveal current ingest API key for CLI config. */
router.get('/servers/:id/ingest-key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (!server.ingest_api_key) {
      const ingest_api_key = generateIngestApiKey();
      await server.update({ ingest_api_key });
      await server.reload();
    }
    res.json({
      id: server.server_id,
      name: server.server_name,
      ingest_api_key: server.ingest_api_key
    });
  } catch (error) {
    logger.error('reveal_ingest_key_error', { error: error.message });
    res.status(500).json({ error: 'Failed to reveal ingest key' });
  }
});

/** Admin: rotate ingest API key (invalidates previous CLI configs). */
router.post('/servers/:id/rotate-ingest-key', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    const ingest_api_key = generateIngestApiKey();
    await server.update({ ingest_api_key });
    try {
      await AuditLog.create({
        user_id: req.user.user_id,
        action: 'ROTATE ingest key',
        details: { server_id: server.server_id, server_name: server.server_name }
      });
    } catch (_) {
      /* non-fatal */
    }
    res.json({
      id: server.server_id,
      name: server.server_name,
      ingest_api_key
    });
  } catch (error) {
    logger.error('rotate_ingest_key_error', { error: error.message });
    res.status(500).json({ error: 'Failed to rotate ingest key' });
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
