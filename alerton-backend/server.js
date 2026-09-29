require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config();
const express = require('express');
const { sequelize, Country, Op } = require('./models/country');
const { Application } = require('./models/application');
const { Server } = require('./models/server');
const { Alert } = require('./models/alert');
const { UserGroup } = require('./models/user_group');
const { User } = require('./models/user');
const cors = require('cors');
const { UserPermission } = require('./models/user_permission');
const { UserGroupMembership } = require('./models/user_group_membership');
const { AuditLog } = require('./models/audit_log');
const { PasswordResetRequest } = require('./models/password_reset_request');
const { generateTotpSecret, buildOtpauthUrl, buildQrDataUrl, verifyTotp } = require('./utils/totp');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync error:', err));

const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error('FATAL: JWT_SECRET (or SECRET_KEY) must be set in the environment');
  process.exit(1);
}

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const ALERT_INGEST_API_KEY = process.env.ALERT_INGEST_API_KEY || '';

app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Change-Token']
}));

// Optional: Middleware to log actions (example)
const auditMiddleware = async (req, res, next) => {
  const userId = req.user?.user_id; // From authenticateToken
  const action = `${req.method} ${req.path}`;

  // Skip middleware logging if the endpoint manually logs (optional)
  const manualLogEndpoints = ['/users/:id', '/groups/:id', '/servers/:id', '/applications/:id'];
  if (manualLogEndpoints.some(path => req.path.match(path))) {
    return next();
  }

  try {
    await AuditLog.create({
      user_id: userId,
      action,
      details: { body: req.body, params: req.params }
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
  next();
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

/** CLI uses X-API-Key; admin UI may use Bearer JWT. */
const authenticateAlertIngest = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (ALERT_INGEST_API_KEY && apiKey && apiKey === ALERT_INGEST_API_KEY) {
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing X-API-Key or Bearer token' });
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'up' });
  } catch (error) {
    res.status(503).json({ status: 'degraded', database: 'down' });
  }
});

// Helper functions (unchanged from Sprint 1)
const getServerIdByName = async (server_name) => {
  const server = await Server.findOne({ where: { server_name } });
  if (!server) throw new Error(`Server not found: ${server_name}`);
  return server.server_id;
};

const getAppIdByName = async (app_name) => {
  const app = await Application.findOne({ where: { app_name } });
  if (!app) throw new Error(`Application not found: ${app_name}`);
  return app.app_id;
};

const getGroupIdByName = async (group_name) => {
  const group = await UserGroup.findOne({ where: { group_name } });
  if (!group) throw new Error(`Group not found: ${group_name}`);
  return group.group_id;
};

const getCountryIdByName = async (country_name) => {
  const country = await Country.findOne({ where: { country_name } });
  if (!country) throw new Error(`Country not found: ${country_name}`);
  return country.country_id;
};

app.get('/check-admin', authenticateToken, requireAdmin, (req, res) => {
  res.json({ isAdmin: true }); // If requireAdmin passes, user is admin
});

// GET /current-user - Get currently logged in user info
app.get('/current-user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// GET /audit - Fetch audit logs
app.get('/audit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch all audit logs
    const logs = await AuditLog.findAll({ order: [['timestamp', 'DESC']] });
    
    // Fetch all users for mapping
    const users = await User.findAll({ attributes: ['user_id', 'username'] });
    const userMap = new Map(users.map(user => [user.user_id, user.username]));
    
    // Map logs with usernames
    const formattedLogs = logs.map(log => ({
      id: log.log_id,
      user: userMap.get(log.user_id) || 'Unknown',
      action: log.action,
      timestamp: log.timestamp,
      details: log.details || {}
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /alerts - Fetch alerts with joined data
app.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      include: [
        { model: Server, attributes: ['server_name', 'ip_address'] },
        // { model: Server, attributes: ['ip_address'] },
        { model: UserGroup, attributes: ['group_name'] },
        { model: Application, attributes: ['app_name'] },
        { model: Country, attributes: ['country_name'] },
      ]
    });
    // Map to frontend-friendly format
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
    console.error('Failed to fetch alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Alert ingest — requires X-API-Key (CLI) or Bearer JWT (UI)
app.post('/alert', authenticateAlertIngest, async (req, res) => {
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
    res.status(200).json({ status: 'Alert received' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint — password, then optional TOTP / forced password change
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !user.is_active || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.must_change_password) {
      const changeToken = jwt.sign(
        { user_id: user.user_id, purpose: 'change_password' },
        SECRET_KEY,
        { expiresIn: '15m' }
      );
      return res.json({
        requires_password_change: true,
        change_token: changeToken,
        username: user.username
      });
    }

    if (user.totp_enabled && user.totp_secret) {
      const preAuthToken = jwt.sign(
        { user_id: user.user_id, purpose: 'totp' },
        SECRET_KEY,
        { expiresIn: '5m' }
      );
      return res.json({ requires_totp: true, pre_auth_token: preAuthToken });
    }

    const token = jwt.sign(
      { user_id: user.user_id, is_admin: user.is_admin },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      totp_enabled: !!user.totp_enabled,
      must_enroll_totp: !user.totp_enabled
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/login/totp', async (req, res) => {
  const { pre_auth_token, totp_code } = req.body;
  try {
    if (!pre_auth_token || !totp_code) {
      return res.status(400).json({ error: 'pre_auth_token and totp_code are required' });
    }
    let payload;
    try {
      payload = jwt.verify(pre_auth_token, SECRET_KEY);
    } catch {
      return res.status(403).json({ error: 'Invalid or expired pre-auth token' });
    }
    if (payload.purpose !== 'totp') {
      return res.status(403).json({ error: 'Invalid token purpose' });
    }
    const user = await User.findByPk(payload.user_id);
    if (!user || !user.totp_enabled || !user.totp_secret) {
      return res.status(400).json({ error: 'TOTP is not enabled for this user' });
    }
    if (!verifyTotp(totp_code, user.totp_secret)) {
      return res.status(401).json({ error: 'Invalid authenticator code' });
    }
    const token = jwt.sign(
      { user_id: user.user_id, is_admin: user.is_admin },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.json({ token, totp_enabled: true });
  } catch (error) {
    console.error('TOTP login failed:', error);
    res.status(500).json({ error: 'TOTP login failed' });
  }
});

const authenticateChangePassword = (req, res, next) => {
  const bearer = req.headers['authorization']?.split(' ')[1];
  const headerToken = req.headers['x-change-token'];
  const token = headerToken || bearer;
  if (!token) return res.status(401).json({ error: 'No change token provided' });
  jwt.verify(token, SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired change token' });
    // Accept dedicated change_password tokens, or a normal session JWT
    if (payload.purpose && payload.purpose !== 'change_password') {
      return res.status(403).json({ error: 'Invalid token purpose' });
    }
    req.user = payload;
    next();
  });
};

app.post('/change-password', authenticateChangePassword, async (req, res) => {
  const { new_password } = req.body;
  try {
    if (!new_password || String(new_password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const password_hash = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash, must_change_password: false });

    await AuditLog.create({
      user_id: user.user_id,
      action: 'password_changed',
      details: { message: 'User set a new password after temp/reset' }
    });

    if (user.totp_enabled && user.totp_secret) {
      const token = jwt.sign(
        { user_id: user.user_id, is_admin: user.is_admin },
        SECRET_KEY,
        { expiresIn: '1h' }
      );
      return res.json({ message: 'Password updated', token, must_enroll_totp: false });
    }

    const token = jwt.sign(
      { user_id: user.user_id, is_admin: user.is_admin },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.json({
      message: 'Password updated',
      token,
      must_enroll_totp: true
    });
  } catch (error) {
    console.error('Change password failed:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

function generateTempPassword() {
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}

// User raises a password-reset request (no email/SMS)
app.post('/password-reset-requests', async (req, res) => {
  const { username } = req.body;
  try {
    if (!username) return res.status(400).json({ error: 'Username is required' });
    const user = await User.findOne({ where: { username } });
    // Always return the same message to avoid account enumeration
    const publicMessage =
      'If this account exists, a reset request was submitted. Contact an administrator for your temporary password.';

    if (!user || !user.is_active) {
      return res.json({ message: publicMessage });
    }

    const existing = await PasswordResetRequest.findOne({
      where: { user_id: user.user_id, status: 'pending' }
    });
    if (!existing) {
      await PasswordResetRequest.create({ user_id: user.user_id, status: 'pending' });
      await AuditLog.create({
        user_id: user.user_id,
        action: 'password_reset_requested',
        details: { username: user.username }
      });
    }

    res.json({ message: publicMessage });
  } catch (error) {
    console.error('Password reset request failed:', error);
    res.status(500).json({ error: 'Failed to submit reset request' });
  }
});

app.get('/password-reset-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await PasswordResetRequest.findAll({
      include: [
        { model: User, as: 'user', attributes: ['user_id', 'username', 'email', 'totp_enabled'] },
        { model: User, as: 'handler', attributes: ['user_id', 'username'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(rows);
  } catch (error) {
    console.error('List password reset requests failed:', error);
    res.status(500).json({ error: 'Failed to list reset requests' });
  }
});

app.post('/password-reset-requests/:id/fulfill', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const request = await PasswordResetRequest.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const resetTotp = Boolean(req.body?.reset_totp);
    const tempPassword = generateTempPassword();
    const password_hash = await bcrypt.hash(tempPassword, 10);
    const updates = {
      password_hash,
      must_change_password: true
    };
    if (resetTotp) {
      updates.totp_secret = null;
      updates.totp_enabled = false;
    }

    await request.user.update(updates);
    await request.update({
      status: 'fulfilled',
      reset_totp: resetTotp,
      handled_by: req.user.user_id,
      notes: req.body?.notes || null
    });

    await AuditLog.create({
      user_id: req.user.user_id,
      action: 'password_reset_fulfilled',
      details: {
        target_user_id: request.user_id,
        reset_totp: resetTotp,
        request_id: request.request_id
      }
    });

    res.json({
      message: 'Temporary password generated. Share it with the user out-of-band.',
      temp_password: tempPassword,
      username: request.user.username,
      reset_totp: resetTotp
    });
  } catch (error) {
    console.error('Fulfill password reset failed:', error);
    res.status(500).json({ error: 'Failed to fulfill reset request' });
  }
});

app.post('/password-reset-requests/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const request = await PasswordResetRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }
    await request.update({
      status: 'rejected',
      handled_by: req.user.user_id,
      notes: req.body?.notes || null
    });
    await AuditLog.create({
      user_id: req.user.user_id,
      action: 'password_reset_rejected',
      details: { request_id: request.request_id }
    });
    res.json({ message: 'Request rejected' });
  } catch (error) {
    console.error('Reject password reset failed:', error);
    res.status(500).json({ error: 'Failed to reject reset request' });
  }
});

app.get('/totp/setup', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.must_change_password) {
      return res.status(403).json({ error: 'Change your temporary password first' });
    }

    const secret = generateTotpSecret();
    await user.update({ totp_secret: secret, totp_enabled: false });
    const otpauthUrl = buildOtpauthUrl(user.username, secret);
    const qr_data_url = await buildQrDataUrl(otpauthUrl);
    res.json({ secret, otpauth_url: otpauthUrl, qr_data_url });
  } catch (error) {
    console.error('TOTP setup failed:', error);
    res.status(500).json({ error: 'Failed to start TOTP setup' });
  }
});

app.post('/totp/enable', authenticateToken, async (req, res) => {
  try {
    const { totp_code } = req.body;
    const user = await User.findByPk(req.user.user_id);
    if (!user || !user.totp_secret) {
      return res.status(400).json({ error: 'Call /totp/setup first' });
    }
    if (!verifyTotp(totp_code, user.totp_secret)) {
      return res.status(401).json({ error: 'Invalid authenticator code' });
    }
    await user.update({ totp_enabled: true });
    await AuditLog.create({
      user_id: user.user_id,
      action: 'totp_enabled',
      details: {}
    });
    res.json({ message: 'Authenticator enabled', totp_enabled: true });
  } catch (error) {
    console.error('TOTP enable failed:', error);
    res.status(500).json({ error: 'Failed to enable TOTP' });
  }
});

// Legacy email OTP endpoints retired (no email/SMS in Secure Core)
app.post('/forgot-password', (req, res) => {
  res.status(410).json({
    error: 'Email OTP is disabled. Submit a password reset request and contact an administrator.'
  });
});
app.post('/verify-otp', (req, res) => {
  res.status(410).json({ error: 'Email OTP is disabled.' });
});
app.post('/reset-password', (req, res) => {
  res.status(410).json({
    error: 'Self-serve email reset is disabled. Use an admin-issued temporary password.'
  });
});

app.get('/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const [alertCount, serverCount, userCount] = await Promise.all([
      Alert.count(),
      Server.count({ where: { is_active: true } }),
      User.count({ where: { is_active: true } })
    ]);
    res.json({ alerts: alertCount, servers: serverCount, users: userCount });
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// User endpoints
app.get('/users', authenticateToken, async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password_hash', 'totp_secret', 'otp_code'] }
  });
  res.json(users);
});

app.post('/users', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { username, password, email, is_admin } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash, email, is_admin });
    await AuditLog.create({ user_id: req.user.user_id, action: 'create_user', details: { username } });
    res.status(201).json(user);
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/users/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  const { username, email, is_admin } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  try {
    await user.update({ username, email, is_admin });
    await AuditLog.create({ user_id: req.user.user_id, action: 'update_user', details: { user_id: req.params.id } });
    res.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/users/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  try {
    await user.destroy();
    await AuditLog.create({ user_id: req.user.user_id, action: 'delete_user', details: { user_id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Group Membership endpoints
app.post('/users/:user_id/groups/:group_id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { user_id, group_id } = req.params;
    await UserGroupMembership.create({ user_id, group_id });
    await AuditLog.create({ user_id: req.user.user_id, action: 'assign_group', details: { user_id, group_id } });
    res.json({ message: 'User added to group' });
  } catch (error) {
    console.error('Failed to add user to group:', error);
    res.status(500).json({ error: 'Failed to add user to group' });
  }
});

app.delete('/users/:user_id/groups/:group_id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { user_id, group_id } = req.params;
    await UserGroupMembership.destroy({ where: { user_id, group_id } });
    await AuditLog.create({ user_id: req.user.user_id, action: 'remove_group', details: { user_id, group_id } });
    res.json({ message: 'User removed from group' });
  } catch (error) {
    console.error('Failed to remove user from group:', error);
    res.status(500).json({ error: 'Failed to remove user from group' });
  }
});

// Permission endpoints
app.post('/permissions', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { user_id, country_id, app_id, group_id, server_id, can_view } = req.body;
    const permission = await UserPermission.create({ user_id, country_id, app_id, group_id, server_id, can_view });
    await AuditLog.create({ user_id: req.user.user_id, action: 'set_permission', details: { permission_id: permission.permission_id } });
    res.status(201).json(permission);
  } catch (error) {
    console.error('Failed to create permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

app.get('/permissions/:user_id', authenticateToken, async (req, res) => {
  const permissions = await UserPermission.findAll({ where: { user_id: req.params.user_id } });
  res.json(permissions);
});

// Alerts endpoint
app.get('/alerts', authenticateToken, async (req, res) => {
  const permissions = await UserPermission.findAll({ where: { user_id: req.user.user_id, can_view: true } });
  const conditions = permissions.map(p => ({
    [sequelize.Op.or]: [
      { country_id: p.country_id || { [sequelize.Op.any]: [p.country_id, null] } },
      { app_id: p.app_id || { [sequelize.Op.any]: [p.app_id, null] } },
      { group_id: p.group_id || { [sequelize.Op.any]: [p.group_id, null] } },
      { server_id: p.server_id || { [sequelize.Op.any]: [p.server_id, null] } }
    ]
  }));
  const alerts = await Alert.findAll({ where: { [sequelize.Op.or]: conditions } });
  res.json(alerts);
});

app.get('/groups', authenticateToken, async (req, res) => {
  try {
    const groups = await UserGroup.findAll();
    res.json(groups);
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST /groups - Create a group
app.post('/groups', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { group_name, description } = req.body;
    if (!group_name) return res.status(400).json({ error: 'Group name is required' });
    const group = await UserGroup.create({ group_name, description });
    res.status(201).json(group);
  } catch (error) {
    console.error('Failed to create group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// PUT /groups/:id - Update a group
app.put('/groups/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const { group_name, description } = req.body;
    const group = await UserGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    await group.update({ group_name: group_name || group.group_name, description });
    res.json(group);
  } catch (error) {
    console.error('Failed to update group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// DELETE /groups/:id - Delete a group
app.delete('/groups/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const group = await UserGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    await group.destroy();
    res.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('Failed to delete group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// GET /servers - List all servers
app.get('/servers', authenticateToken, async (req, res) => {
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
    console.error('Failed to fetch servers:', error);
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

// POST /servers - Create a server
app.post('/servers', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
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
    console.error('Failed to create server:', error);
    res.status(500).json({ error: 'Failed to create server' });
  }
});

// PUT /servers/:id - Update a server
app.put('/servers/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
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
    console.error('Failed to update server:', error);
    res.status(500).json({ error: 'Failed to update server' });
  }
});

// DELETE /servers/:id - Delete a server
app.delete('/servers/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    await server.destroy();
    res.json({ message: 'Server deleted' });
  } catch (error) {
    console.error('Failed to delete server:', error);
    res.status(500).json({ error: 'Failed to delete server' });
  }
});

// GET /countries - For dropdown (optional, but useful)
app.get('/countries', authenticateToken, async (req, res) => {
  try {
    const countries = await Country.findAll();
    res.json(countries);
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// GET /applications - List all applications
app.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.findAll();
    const formattedApps = applications.map(app => ({
      id: app.app_id,
      name: app.app_name,
      description: app.description || ''
    }));
    res.json(formattedApps);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST /applications - Create an application
app.post('/applications', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
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
    console.error('Failed to create application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// PUT /applications/:id - Update an application
app.put('/applications/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
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
    console.error('Failed to update application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE /applications/:id - Delete an application
app.delete('/applications/:id', authenticateToken, requireAdmin, auditMiddleware, async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    await app.destroy();
    res.json({ message: 'Application deleted' });
  } catch (error) {
    console.error('Failed to delete application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));