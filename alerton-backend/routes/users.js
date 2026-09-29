const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const { UserGroupMembership } = require('../models/user_group_membership');
const { AuditLog } = require('../models/audit_log');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/users', authenticateToken, async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password_hash', 'totp_secret', 'otp_code'] }
  });
  res.json(users);
});

router.post('/users', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { username, password, email, is_admin } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash, email, is_admin });
    await AuditLog.create({ user_id: req.user.user_id, action: 'create_user', details: { username } });
    res.status(201).json(user);
  } catch (error) {
    logger.error('create_user_error', { error: error.message });
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  const { username, email, is_admin } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  try {
    await user.update({ username, email, is_admin });
    await AuditLog.create({ user_id: req.user.user_id, action: 'update_user', details: { user_id: req.params.id } });
    res.json(user);
  } catch (error) {
    logger.error('update_user_error', { error: error.message });
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  try {
    await user.destroy();
    await AuditLog.create({ user_id: req.user.user_id, action: 'delete_user', details: { user_id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    logger.error('delete_user_error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.post('/users/:user_id/groups/:group_id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { user_id, group_id } = req.params;
    await UserGroupMembership.create({ user_id, group_id });
    await AuditLog.create({ user_id: req.user.user_id, action: 'assign_group', details: { user_id, group_id } });
    res.json({ message: 'User added to group' });
  } catch (error) {
    logger.error('assign_group_error', { error: error.message });
    res.status(500).json({ error: 'Failed to add user to group' });
  }
});

router.delete('/users/:user_id/groups/:group_id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { user_id, group_id } = req.params;
    await UserGroupMembership.destroy({ where: { user_id, group_id } });
    await AuditLog.create({ user_id: req.user.user_id, action: 'remove_group', details: { user_id, group_id } });
    res.json({ message: 'User removed from group' });
  } catch (error) {
    logger.error('remove_group_error', { error: error.message });
    res.status(500).json({ error: 'Failed to remove user from group' });
  }
});

module.exports = router;
