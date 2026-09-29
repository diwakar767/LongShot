# Non-Functional Goals

Lab-to-team scale. Prefer clarity and maintainability over premature distributed-system complexity.

## NF-1 Security
- No secrets in source control (`.env` / credentials ignored).
- Config via environment variables (`DATABASE_URL`, `JWT_SECRET`, `ALERT_INGEST_API_KEY`, etc.).
- Authenticated alert ingest; JWT for UI APIs.
- CORS restricted to known origins.
- HTTPS and hardened password-reset binding (target sprints).
- Principle of least privilege for non-admin users (target).

## NF-2 Reliability
- API retries on CLI (3×) for transient failures.
- Postgres durable volume in Docker.
- Health check (`GET /health`) for orchestration.
- Avoid destructive schema sync in production (migrations target).

## NF-3 Maintainability
- Documented architecture, stories, sprints, and AI/dev rules.
- Small, reviewable changes; monorepo with clear package boundaries.
- Replace fat `server.js` with routes/services over time (planned).
- Meaningful README and runbooks.

## NF-4 Usability
- Admin UI usable without training for core CRUD and alert review.
- Human, restrained visual design (no AI-slop aesthetics).
- Measured UX improvements (dialogs over `prompt()`/`confirm()`) in polish sprint.

## NF-5 Performance (lab bounds)
- Comfortable with hundreds-to-low-thousands of alerts in UI with client filters initially.
- Server-side pagination and indexes before heavy load (planned).
- Avoid N+1 where practical when refactoring queries.

## NF-6 Observability
- Structured logging (planned).
- Audit trail for admin actions (present).
- Health endpoint for liveness (Phase 1).

## NF-7 Portability
- Docker Compose as primary local environment (no VirtualBox dependency).
- CLI runnable on host against published API port.
- Env-based URLs for frontend/backend separation.
