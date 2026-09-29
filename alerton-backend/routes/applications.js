const express = require('express');
const { Application } = require('../models/application');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.findAll();
    const formattedApps = applications.map(app => ({
      id: app.app_id,
      name: app.app_name,
      description: app.description || ''
    }));
    res.json(formattedApps);
  } catch (error) {
    logger.error('fetch_applications_error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.post('/applications', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { app_name, description } = req.body;
    if (!app_name) return res.status(400).json({ error: 'Application name is required' });
    const app = await Application.create({ app_name, description });
    res.status(201).json({
      id: app.app_id,
      name: app.app_name,
      description: app.description || ''
    });
  } catch (error) {
    logger.error('create_application_error', { error: error.message });
    res.status(500).json({ error: 'Failed to create application' });
  }
});

router.put('/applications/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { app_name, description } = req.body;
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    await app.update({
      app_name: app_name || app.app_name,
      description: description || app.description
    });
    res.json({
      id: app.app_id,
      name: app.app_name,
      description: app.description || ''
    });
  } catch (error) {
    logger.error('update_application_error', { error: error.message });
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/applications/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    await app.destroy();
    res.json({ message: 'Application deleted' });
  } catch (error) {
    logger.error('delete_application_error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
