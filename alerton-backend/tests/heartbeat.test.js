const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

require('./setupEnv');

const { createApp } = require('../app');
const { runMigrations } = require('../migrate');
const { agentStatusFromHeartbeat } = require('../services/agentStatus');

describe('agent heartbeat', () => {
  let app;
  let apiKey;
  let token;

  before(async () => {
    assert.ok(process.env.JWT_SECRET || process.env.SECRET_KEY, 'JWT_SECRET required');
    apiKey = process.env.ALERT_INGEST_API_KEY || '';
    await runMigrations();
    app = createApp();

    const login = await request(app).post('/login').send({ username: 'admin', password: 'admin123' });
    assert.equal(login.status, 200);
    assert.ok(login.body.token);
    token = login.body.token;
  });

  it('derives live/down/unknown from heartbeat age', () => {
    assert.equal(agentStatusFromHeartbeat(null), 'unknown');
    assert.equal(agentStatusFromHeartbeat(new Date()), 'live');
    const old = new Date(Date.now() - 31 * 60 * 1000);
    assert.equal(agentStatusFromHeartbeat(old), 'down');
  });

  it('records heartbeat with X-API-Key and surfaces on servers + dashboard', async () => {
    assert.ok(apiKey, 'ALERT_INGEST_API_KEY must be set');

    const hb = await request(app)
      .post('/agent/heartbeat')
      .set('X-API-Key', apiKey)
      .send({ server_name: 'cli1-server' });
    assert.equal(hb.status, 200);
    assert.equal(hb.body.agent_status, 'live');

    const servers = await request(app)
      .get('/servers')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(servers.status, 200);
    const target = servers.body.find((s) => s.name === 'cli1-server');
    assert.ok(target, 'cli1-server should exist');
    assert.equal(target.agent_status, 'live');
    assert.ok(target.agent_last_heartbeat_at);

    const summary = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(summary.status, 200);
    assert.ok(summary.body.agents_total >= 1);
    assert.ok(summary.body.agents_live >= 1);
    assert.match(String(summary.body.agents_label || ''), /^\d+\/\d+$/);
  });

  it('rejects heartbeat without auth', async () => {
    const res = await request(app)
      .post('/agent/heartbeat')
      .send({ server_name: 'cli1-server' });
    assert.equal(res.status, 401);
  });
});
