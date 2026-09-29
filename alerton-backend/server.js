require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config();

const logger = require('./utils/logger');
const { runMigrations } = require('./migrate');
const { createApp } = require('./app');

async function boot() {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  if (!secret) {
    logger.error('fatal_missing_jwt_secret');
    process.exit(1);
  }

  await runMigrations();

  const app = createApp();
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    logger.info('server_listening', { port: PORT });
  });
}

boot().catch((err) => {
  logger.error('boot_failed', { error: err.message });
  process.exit(1);
});
