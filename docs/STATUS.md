# Project Status

**Last updated:** 2026-09-29  
**Phase:** Phase 1 â€” Docs, Docker, Foundations (**complete**)  
**Remote:** https://github.com/diwakar767/LongShot.git (private)

## What works now

- Backend Express API with Sequelize models and JWT UI auth
- CLI alert ingest with required `X-API-Key`
- Admin web UI: dashboard, alerts, servers, groups, users, applications, audit
- Docker Compose stack: `postgres`, `backend`, `frontend`
- Env-based configuration (`.env.example`)
- Host Postgres dumped and restored into Docker Postgres (`localhost:5433`)

## What does not work / stubs

- Requests page (mock)
- Settings page (no persistence / no notify)
- Permission-scoped alert listing (duplicate route)
- Push / FCM / mobile
- HTTPS, rate limits, production migrations

## Local runtime

| Component | Endpoint |
|-----------|----------|
| UI | http://localhost:3000 |
| API | http://localhost:5000 |
| Health | http://localhost:5000/health |
| Postgres (Docker) | localhost:5433 |

**Lab login (restored DB):** `admin` / `admin123`  
**CLI API key:** `ALERT_INGEST_API_KEY` / `alerton-cli/config.yaml` `api_key`

Start: `docker compose up --build`

## Restored row counts (pre-probe)

| Entity | Count |
|--------|------:|
| Users | 4 |
| Servers | 5 |
| Alerts | 5 (7 after Phase 1 ingest probes) |
| Countries | 4 |
| Applications | 4 |
| UserGroups | 3 |
| AuditLogs | 44 |

### Verification log

| Check | Result | When |
|-------|--------|------|
| Host `pg_dump` | OK (~314KB) | 2026-09-29 |
| Docker postgres healthy | OK | 2026-09-29 |
| `pg_restore` | OK (exit 0) | 2026-09-29 |
| Row count match | OK | 2026-09-29 |
| `GET /health` | OK `{status:ok,database:up}` | 2026-09-29 |
| Login + dashboard | OK (admin / summary) | 2026-09-29 |
| Ingest without API key | OK 401 | 2026-09-29 |
| Ingest with API key / CLI | OK Alert received | 2026-09-29 |
| Frontend http://localhost:3000 | OK 200 | 2026-09-29 |
| Push to LongShot | OK | 2026-09-29 |

## Blockers

None for Phase 1.
