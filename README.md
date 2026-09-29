# LongShot (AlertOn)

Private monorepo for the AlertOn alert reporting system: CLI ingest, Express API, React admin UI, PostgreSQL.

## Quick start (Docker)

1. Copy env file and adjust secrets:

```bash
cp .env.example .env
```

2. Start the stack:

```bash
docker compose up --build
```

- UI: http://localhost:3000  
- API: http://localhost:5000/health  
- Postgres: `localhost:5433` (mapped from container `5432`)

3. Log in with a user from your database (lab default after restore: `admin` / `admin123`).

## Migrate data from host PostgreSQL

If you already have a Windows/host Postgres `alerton` database on port 5432:

```bash
# From repo root (Git Bash / PowerShell with pg tools on PATH)
pg_dump -h localhost -U alerton -d alerton -F c -f backups/alerton_host.dump

docker compose up -d postgres
# wait until healthy, then:
pg_restore -h localhost -p 5433 -U alerton -d alerton --clean --if-exists backups/alerton_host.dump
```

Then start backend/frontend (`docker compose up --build`) and confirm data in the UI.

## CLI

```bash
cd alerton-cli
# Copy config.example.yaml → config.yaml (or config.local.yaml) and set api_key
# to the same value as ALERT_INGEST_API_KEY in root .env
node cli.js --message "Disk full" --severity major
node cli.js --dry-run
```

Without a valid `X-API-Key`, `POST /alert` returns 401.

## Packages

| Path | Role |
|------|------|
| `alerton-backend` | Express + Sequelize API |
| `alerton-frontend` | CRA + MUI admin UI |
| `alerton-cli` | Alert submission client |
| `docs/` | Stories, goals, architecture, sprints, status |

## Documentation

- [User stories](docs/USER_STORIES.md)
- [Functional goals](docs/FUNCTIONAL_GOALS.md)
- [Non-functional goals](docs/NON_FUNCTIONAL_GOALS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Sprint plan](docs/SPRINTS.md)
- [TODO](docs/TODO.md)
- [Status](docs/STATUS.md)
- [AI / agent rules](docs/AIRULES.md)

## Local backend without Docker (optional)

```bash
# Point DATABASE_URL at Docker postgres or host postgres
cd alerton-backend && npm install && npm start
cd alerton-frontend && npm install && npm start
```

Ensure root `.env` defines `JWT_SECRET` and `ALERT_INGEST_API_KEY`.
