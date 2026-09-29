const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

require('./setupEnv');

const { createApp } = require('../app');
const { runMigrations } = require('../migrate');
const { buildFingerprint } = require('../services/fingerprint');

describe('alarm lifecycle', () => {
  let app;
  let apiKey;

  before(async () => {
    assert.ok(process.env.JWT_SECRET || process.env.SECRET_KEY, 'JWT_SECRET required');
    apiKey = process.env.ALERT_INGEST_API_KEY || '';
    await runMigrations();
    app = createApp();
  });

  it('opens, reasserts, then resolves by fingerprint', async () => {
    assert.ok(apiKey, 'ALERT_INGEST_API_KEY must be set for this test');
    const payload = {
      message: `lifecycle-${Date.now()}`,
      severity: 'minor',
      server_name: 'cli1-server',
      group_name: 'techops',
      app_name: 'monitor',
      country_name: 'United States'
    };
    const fingerprint = buildFingerprint(payload);

    const open = await request(app)
      .post('/alert')
      .set('X-API-Key', apiKey)
      .send(payload);
    assert.equal(open.status, 200);
    assert.equal(open.body.action, 'open');
    assert.equal(open.body.fingerprint, fingerprint);

    const reassert = await request(app)
      .post('/alert')
      .set('X-API-Key', apiKey)
      .send(payload);
    assert.equal(reassert.status, 200);
    assert.equal(reassert.body.action, 'reassert');
    assert.equal(reassert.body.alert_id, open.body.alert_id);

    const resolve = await request(app)
      .post('/alert/resolve')
      .set('X-API-Key', apiKey)
      .send({ fingerprint });
    assert.equal(resolve.status, 200);
    assert.equal(resolve.body.action, 'resolve');

    const noop = await request(app)
      .post('/alert/resolve')
      .set('X-API-Key', apiKey)
      .send({ fingerprint });
    assert.equal(noop.status, 200);
    assert.equal(noop.body.action, 'noop');
  });
});
