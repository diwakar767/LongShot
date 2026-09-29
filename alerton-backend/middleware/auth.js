const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY;
const ALERT_INGEST_API_KEY = process.env.ALERT_INGEST_API_KEY || '';

function getSecretKey() {
  return process.env.JWT_SECRET || process.env.SECRET_KEY || SECRET_KEY;
}

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, getSecretKey(), (err, user) => {
    if (err) {
      logger.warn('auth_token_invalid');
      return res.status(403).json({ error: 'Invalid token' });
    }
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
  const ingestKey = process.env.ALERT_INGEST_API_KEY || ALERT_INGEST_API_KEY;
  if (ingestKey && apiKey && apiKey === ingestKey) {
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    logger.warn('ingest_auth_missing');
    return res.status(401).json({ error: 'Missing X-API-Key or Bearer token' });
  }
  jwt.verify(token, getSecretKey(), (err, user) => {
    if (err) {
      logger.warn('ingest_jwt_invalid');
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const authenticateChangePassword = (req, res, next) => {
  const bearer = req.headers['authorization']?.split(' ')[1];
  const headerToken = req.headers['x-change-token'];
  const token = headerToken || bearer;
  if (!token) return res.status(401).json({ error: 'No change token provided' });
  jwt.verify(token, getSecretKey(), (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired change token' });
    if (payload.purpose && payload.purpose !== 'change_password') {
      return res.status(403).json({ error: 'Invalid token purpose' });
    }
    req.user = payload;
    next();
  });
};

module.exports = {
  getSecretKey,
  authenticateToken,
  requireAdmin,
  authenticateAlertIngest,
  authenticateChangePassword
};
