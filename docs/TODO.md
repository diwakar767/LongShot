# TODO Backlog

Priorities: P0 blocker · P1 next · P2 later. Tags map to [SPRINTS.md](./SPRINTS.md) / [ROADMAP.md](./ROADMAP.md).

| ID | Priority | Sprint | Item | Status |
|----|----------|--------|------|--------|
| T-001–T-006 | P0 | Phase1 | Repo, docs, Docker, env, migrate, push | Done |
| T-010–T-015 | P0 | SecureCore | Reset request, temp password, TOTP, axios | Done |
| T-020 | P1 | BackendHardening | Split routes/services from `server.js` | Done |
| T-021 | P1 | BackendHardening | Real migrations; disable alter-sync in prod | Done |
| T-022 | P1 | BackendHardening | Structured logging + auth/ingest/reset tests | Done |
| T-023 | P0 | BackendHardening | Remove duplicate dead `GET /alerts` | Done |
| T-030 | P1 | UXMobileFirst | Mobile-first responsive shell | Done |
| T-031 | P1 | UXMobileFirst | Dialogs/snackbars; remove prompt/confirm/alert | Done |
| T-032 | P1 | UXMobileFirst | Animations (nav, lists, severity emphasis) | Done |
| T-033 | P1 | UXMobileFirst | Dynamic UX (skeletons, empty states) | Done |
| T-034 | P2 | UXMobileFirst | Theme cleanup + dead code/deps | Done |
| T-050 | P1 | PermissionsAccess | Wire permission-scoped alerts | Done |
| T-051 | P1 | PermissionsAccess | Group/server access request API + UI | Done |
| T-052 | P2 | PermissionsAccess | Users UI: real group assignment | Done |
| T-040 | P1 | InAppNotifications | Notification model + list/unread/mark-read APIs | Todo |
| T-041 | P1 | InAppNotifications | Create notifications on alert ingest | Todo |
| T-042 | P1 | InAppNotifications | Bell + panel UI (mobile-first) | Todo |
| T-043 | P1 | InAppNotifications | Severity prefs in Settings drive notify | Todo |
| T-060 | P2 | MobileClient | Optional client using same APIs + in-app inbox | Todo |

**Dropped / superseded:** paid email notify as primary path; mandatory FCM for MVP.

Update when work finishes; keep [STATUS.md](./STATUS.md) and [ROADMAP.md](./ROADMAP.md) current.
