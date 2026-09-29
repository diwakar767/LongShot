# Architecture

## Context

LongShot (product name in GitHub) implements the AlertOn alert reporting system:

- **Engineers** send alerts via CLI.
- **Admins / operators** manage inventory and view alerts in a web UI.
- **Users** (future) receive scoped notifications.

```text
[CLI agents] --X-API-Key--> [Backend API] <---JWT--- [Web UI]
                                 |
                                 v
                           [PostgreSQL]
```

## Containers (Docker Compose)

| Service | Image / build | Host port | Role |
|---------|---------------|-----------|------|
| `postgres` | `postgres:15-alpine` | `5433→5432` | Primary data store |
| `backend` | `./alerton-backend` | `5000` | Express + Sequelize API |
| `frontend` | `./alerton-frontend` | `3000` | CRA admin UI |

CLI runs on the host (not containerized by default).

## Current application structure

```text
alerton-backend/     Express monolith (server.js) + Sequelize models/
alerton-frontend/    React CRA + MUI pages
alerton-cli/         Commander + axios ingest client
docs/                Product & engineering documentation
docker-compose.yml   Local stack
```

### Backend pattern
Fat controller in `server.js`, thin Sequelize models, OTP email util. Schema currently via `sequelize.sync({ alter: true })` (to be replaced by migrations).

### Auth model
- UI: JWT (`Authorization: Bearer`), secret from `JWT_SECRET`.
- Ingest: `X-API-Key` matching `ALERT_INGEST_API_KEY`, or Bearer JWT for admin UI create-alert.

### Core entities
Users, UserGroups, UserGroupMemberships, UserPermissions, Countries, Applications, Servers, Alerts, AuditLogs.

Alert severity enum: `trivial | minor | major | critical`.

## Target architecture (incremental)

1. Env/config + Docker + authenticated ingest (**Phase 1 — done**).
2. Secure core (reset-password, axios interceptors, CORS/API URL hygiene).
3. Backend modularization + SQL migrations + logging/tests.
4. Measured UX polish.
5. Email notification pipeline using groups + settings.
6. Subscription requests + permission-scoped alert queries.
7. Optional FCM / mobile.

## API surface (summary)

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | none |
| POST | `/login` | none |
| POST | `/alert` | API key or JWT |
| GET | `/alerts` | JWT |
| CRUD | `/users`, `/groups`, `/servers`, `/applications` | JWT (+ admin for mutations) |
| GET | `/countries`, `/audit`, `/dashboard/summary`, `/check-admin`, `/current-user` | JWT |
| POST | `/forgot-password`, `/verify-otp`, `/reset-password` | none (to harden) |

## Data migration

Host PostgreSQL (legacy VirtualBox/lab) → Docker volume via `pg_dump` / `pg_restore`. See `docs/STATUS.md` and README runbook.

## Explicit non-goals (near term)
Microservices, Kubernetes, multi-region, or full React Native until notification + permission foundations exist.
