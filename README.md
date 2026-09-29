# LongShot (AlertOn)

Private monorepo: CLI agents, Express API, React admin UI, PostgreSQL.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Docker Desktop** + Compose v2 | Primary path for API + UI + Postgres |
| **Node.js 18+** | Required on every **agent host** that runs the CLI (Docker optional there) |
| Free ports | `3000` (UI), `5000` (API), `5433` (Postgres host map) |

## Quick start (admin server)

```bash
cp .env.example .env
# Set JWT_SECRET, POSTGRES_PASSWORD, and optional BOOTSTRAP_ADMIN_* values
docker compose up --build
```

| Service | URL |
|---------|-----|
| UI | http://localhost:3000 |
| API health | http://localhost:5000/health |
| Postgres | `localhost:5433` (named volume `longshot_pgdata` — data persists across restarts) |

### First login

1. Sign in as bootstrap admin (defaults: `admin` / `ChangeMeNow!`, overridable via env).
2. You **must** set a new password.
3. Authenticator (TOTP) setup opens next — use **Skip for now** if you prefer optional TOTP later (Settings).
4. As admin, create inventory before agents can report:
   - **Countries** → **Applications** → **Groups** → **Servers** → **Users**
5. When you create a **Server**, copy its unique **agent API key** into that host’s CLI `config.yaml`.

## CLI agent (any host with Node)

```bash
cd alerton-cli
cp config.example.yaml config.yaml
# Set url, server_name (must match UI), and api_key from Servers → Agent key
npm install   # if needed
node cli.js --message "Disk full" --severity major
node cli.js --agent                 # long-lived heartbeat + resolve flush
```

See [docs/GUIDE_ENGINEER.md](docs/GUIDE_ENGINEER.md) for always-on setup:

- **Linux:** `scripts/install-linux-service.sh` + `systemd/alerton-agent.service`
- **Windows:** NSSM (`install-windows-service.ps1`) or Task Scheduler fallback


## Documentation

| Doc | Audience |
|-----|----------|
| [Deploy & persistence](docs/DEPLOY.md) | Operators standing up the stack |
| [Admin guide](docs/GUIDE_ADMIN.md) | Admins / operators |
| [Engineer / CLI guide](docs/GUIDE_ENGINEER.md) | Agent hosts |
| [User guide](docs/GUIDE_USER.md) | Regular web users |
| [Architecture](docs/ARCHITECTURE.md) | How the system fits together |

## Packages

| Path | Role |
|------|------|
| `alerton-backend` | Express + Sequelize API |
| `alerton-frontend` | CRA + MUI web UI |
| `alerton-cli` | Alert + heartbeat agent (Node only) |
| `docs/` | Deploy and role guides |

## Auth model (short)

- **Web UI:** JWT after login.
- **CLI / agents:** per-**server** `X-API-Key` (unique key generated when the server is created; reveal/rotate in Admin → Servers).
- Global shared ingest key is **not** used.
