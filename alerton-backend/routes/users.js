const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const { UserGroupMembership } = require('../models/user_group_membership');
const { UserGroup } = require('../models/user_group');
const { AuditLog } = require('../models/audit_log');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash', 'totp_secret', 'otp_code'] }
    });
    const memberships = await UserGroupMembership.findAll();
    const groups = await UserGroup.findAll({ attributes: ['group_id', 'group_name'] });
    const groupMap = new Map(groups.map((g) => [g.group_id, g.group_name]));
    const byUser = new Map();
    for (const m of memberships) {
      const list = byUser.get(m.user_id) || [];
      list.push({ group_id: m.group_id, group_name: groupMap.get(m.group_id) || `group#${m.group_id}` });
      byUser.set(m.user_id, list);
    }
    res.json(
      users.map((u) => {
        const json = u.toJSON();
        return { ...json, groups: byUser.get(u.user_id) || [] };
      })
    );
  } catch (error) {
    logger.error('list_users_error', { error: error.message });
    res.status(500).json({ error: 'Failed to list users' });
  }
});

router.get('/users/:user_id/groups', authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.params.user_id);
    if (!req.user.is_admin && req.user.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const memberships = await UserGroupMembership.findAll({ where: { user_id: userId } });
    const groupIds = memberships.map((m) => m.group_id);
    const groups = groupIds.length
      ? await UserGroup.findAll({ where: { group_id: groupIds } })
      : [];
    res.json(groups.map((g) => ({ group_id: g.group_id, group_name: g.group_name })));
  } catch (error) {
    logger.error('list_user_groups_error', { error: error.message });
    res.status(500).json({ error: 'Failed to list user groups' });
  }
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
