const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

require('./setupEnv');

const { createApp } = require('../app');
const { runMigrations } = require('../migrate');

describe('alert ingest', () => {
  let app;
  let apiKey;

  before(async () => {
    assert.ok(process.env.JWT_SECRET || process.env.SECRET_KEY, 'JWT_SECRET required');
    apiKey = process.env.ALERT_INGEST_API_KEY || '';
    await runMigrations();
    app = createApp();
  });

  it('rejects ingest without auth', async () => {
    const res = await request(app)
      .post('/alert')
      .send({ message: 'test', severity: 'minor' });
    assert.equal(res.status, 401);
  });

  it('accepts ingest with X-API-Key when configured', async () => {
    assert.ok(apiKey, 'ALERT_INGEST_API_KEY must be set for this test');
    const res = await request(app)
      .post('/alert')
      .set('X-API-Key', apiKey)
      .send({
        message: `hardening-test-${Date.now()}`,
        severity: 'trivial',
        server_name: 'cli1-server',
        group_name: 'techops',
        app_name: 'monitor',
        country_name: 'United States'
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Alert received');
  });
});
