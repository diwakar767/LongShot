const { Command } = require('commander');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const program = new Command();
program
  .option('--message <msg>', 'Alert message', 'CLI Test')
  .option('--severity <level>', 'Severity (trivial, minor, major, critical)', 'minor')
  .option('--server-name <name>', 'Server name', 'cli1-server')
  .option('--group-name <name>', 'Group name', 'techops')
  .option('--app-name <name>', 'Application name', 'monitor')
  .option('--country-name <name>', 'Country name', 'United States')
  .option('--api-key <key>', 'Ingest API key (overrides config.yaml)')
  .option('--dry-run', 'Log without sending', false);

program.parse(process.argv);
const options = program.opts();

const configPath = path.resolve(process.cwd(), 'config.yaml');
const config = fs.existsSync(configPath)
  ? yaml.load(fs.readFileSync(configPath, 'utf8')) || {}
  : {};

const alert = {
  message: options.message || config.message,
  severity: options.severity || config.severity,
  server_name: options.serverName || config.server_name,
  group_name: options.groupName || config.group_name,
  app_name: options.appName || config.app_name,
  country_name: options.countryName || config.country_name,
};

const apiKey = options.apiKey || config.api_key || process.env.ALERT_INGEST_API_KEY;
const url = config.url || 'http://127.0.0.1:5000/alert';

async function sendAlert(attempt = 1) {
  if (options.dryRun) {
    console.log('Dry run - Alert would be sent:', alert);
    console.log('URL:', url, 'API key set:', Boolean(apiKey));
    return;
  }
  if (!apiKey) {
    console.error('Missing API key. Set api_key in config.yaml, ALERT_INGEST_API_KEY, or --api-key.');
    process.exitCode = 1;
    return;
  }
  try {
    const res = await axios.post(url, alert, {
      timeout: 5000,
      headers: { 'X-API-Key': apiKey },
    });
    console.log('Response:', res.data);
  } catch (err) {
    console.error(`Attempt ${attempt}/3 failed: ${err.response?.data?.error || err.message}`);
    if (attempt < 3) {
      console.log('Retrying in 1 second...');
      setTimeout(() => sendAlert(attempt + 1), 1000);
    } else {
      console.error('All retries failed. Check server or network.');
      process.exitCode = 1;
    }
  }
}

sendAlert();
