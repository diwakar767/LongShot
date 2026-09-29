const crypto = require('crypto');

function generateIngestApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { generateIngestApiKey };
