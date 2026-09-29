# Architecture

## Context

LongShot implements AlertOn:

- **Engineers** run Node CLI agents (per-server API key).
- **Admins** manage inventory and view everything in the web UI.
- **Users** see scoped alerts and in-app notifications.

```text
[CLI agents] --X-API-Key (per server)--> [Backend API] <---JWT--- [Web UI]
                                              |
                                              v
                                        [PostgreSQL]
                                         volume: longshot_pgdata
```

## Containers (Docker Compose)

| Service | Build / image | Host port | Persistence |
|---------|---------------|-----------|-------------|
| `postgres` | `postgres:15-alpine` | `5433→5432` | Named volume `longshot_pgdata` |
| `backend` | `./alerton-backend` | `5000` | Stateless (DB holds data) |
| `frontend` | `./alerton-frontend` | `3000` | Stateless |

CLI runs on agent hosts (Node 18+); not containerized by default.

## Application structure

```text
alerton-backend/   app.js + routes/ + middleware/ + services/ + migrations/
alerton-frontend/  React CRA + MUI
alerton-cli/       Commander agent (alert, resolve, heartbeat, --agent)
docs/              Deploy + role guides
```

### Boot sequence
1. Umzug migrations  
2. `bootstrapAdmin()` if no admin exists (`must_change_password: true`)  
3. Listen; periodic retention prune  

### Auth
- UI: JWT (`JWT_SECRET`)
- Ingest / resolve / heartbeat: **per-server** `ingest_api_key` via `X-API-Key`, or admin JWT for UI-created alerts
- Password change: short-lived change token; TOTP optional (Skip allowed)

### Retention
`app.retention_days` → `server.retention_days` → `ALERT_RETENTION_DAYS` (default 30)

### Agent liveness
CLI heartbeat every `heartbeat_interval_seconds` (default 900). Server **Down** after 2× interval without a beat.

## Explicit non-goals (near term)
Microservices, Kubernetes, paid SMS/email/FCM as primary notify, mandatory per-host mTLS.
