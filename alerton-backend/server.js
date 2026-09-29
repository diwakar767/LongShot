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
const { sendOTPEmail } = require('./utils/email');
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
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

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ user_id: user.user_id, is_admin: user.is_admin }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// User endpoints
app.get('/users', authenticateToken, async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
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

// Generate and send OTP
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.update({
      otp_code: otp,
      otp_expires_at: expiresAt
    });

    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      where: {
        email,
        otp_code: otp,
        otp_expires_at: { [Op.gt]: new Date() } // Use imported Op
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await user.update({
      otp_code: null,
      otp_expires_at: null
    });

    res.json({ message: 'OTP verified', user_id: user.user_id });
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Reset password
app.post('/reset-password', async (req, res) => {
  const { user_id, new_password } = req.body;
  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash });

    await AuditLog.create({
      user_id: user.user_id,
      action: 'password_reset',
      details: { message: 'User reset their password' }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
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

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));