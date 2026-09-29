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

## NF-4 Usability / experience
- Admin and user UI usable without training for core flows.
- **Mobile-first** layouts; desktop remains usable.
- Human, restrained visual design (no AI-slop aesthetics).
- **Dynamic** UI: clear loading/empty/error states.
- **Purposeful animations** for hierarchy and feedback (nav, lists, severity), not noise.
- Dialogs/snackbars instead of browser `prompt`/`confirm`/`alert`.

## NF-5 Performance (lab bounds)
- Comfortable with hundreds-to-low-thousands of alerts in UI with client filters initially.
- Server-side pagination and indexes before heavy load (planned).
- Avoid N+1 where practical when refactoring queries.
- In-app notification queries indexed by user + unread.

## NF-6 Observability
- Structured logging (planned).
- Audit trail for admin actions (present).
- Health endpoint for liveness (Phase 1).

## NF-7 Portability / cost
- Docker Compose as primary local environment (no VirtualBox dependency).
- CLI runnable on host against published API port.
- Env-based URLs for frontend/backend separation.
- Core product runs **without paid notification providers**.
