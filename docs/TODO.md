# TODO Backlog

Priorities: P0 blocker Â· P1 next Â· P2 later. Tags map to [SPRINTS.md](./SPRINTS.md).

| ID | Priority | Sprint | Item | Status |
|----|----------|--------|------|--------|
| T-001 | P0 | Phase1 | Repo layout, `.gitignore`, `.env.example` | Done |
| T-002 | P0 | Phase1 | Docs pack (stories, goals, architecture, sprints, status, airules) | Done |
| T-003 | P0 | Phase1 | Docker Compose + Dockerfiles | Done |
| T-004 | P0 | Phase1 | Env JWT/DB/CORS; ingest API key; CLI update | Done |
| T-005 | P0 | Phase1 | pg_dump host â†’ restore Docker; verify | Done |
| T-006 | P0 | Phase1 | Push baseline to `diwakar767/LongShot` | Done |
| T-010 | P0 | SecureCore | OTP-bound password reset token | Todo |
| T-011 | P0 | SecureCore | Axios instance + 401 interceptor | Todo |
| T-012 | P1 | SecureCore | Rate-limit login / forgot-password | Todo |
| T-020 | P1 | BackendHardening | Split routes/services from `server.js` | Todo |
| T-021 | P1 | BackendHardening | Real migrations; disable alter-sync in prod | Todo |
| T-022 | P1 | BackendHardening | Structured logging + tests for auth/ingest | Todo |
| T-023 | P0 | BackendHardening | Remove duplicate dead `GET /alerts` | Todo |
| T-030 | P1 | UXPolish | Theme refine; dialogs instead of prompt/confirm | Todo |
| T-031 | P1 | UXPolish | Finish or remove Requests/Settings stubs | Todo |
| T-032 | P2 | UXPolish | Dead code/dep cleanup | Todo |
| T-040 | P1 | NotifyEmail | Persist push/email severity settings | Todo |
| T-041 | P1 | NotifyEmail | Fan-out email on ingest; `notification_sent` | Todo |
| T-050 | P1 | RequestsPermissions | Wire permission-scoped alerts | Todo |
| T-051 | P1 | RequestsPermissions | Subscription request API + UI | Todo |
| T-052 | P2 | RequestsPermissions | Lock / temp-password user fields | Todo |
| T-060 | P2 | FCM/Mobile | Firebase + mobile client | Todo |

Update this table when work starts or finishes; keep [STATUS.md](./STATUS.md) as the narrative snapshot.
