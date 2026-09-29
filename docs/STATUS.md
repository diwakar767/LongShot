# Project Status

**Last updated:** 2026-09-29  
**Active sprint next:** Permissions + access requests  
**Remote:** https://github.com/diwakar767/LongShot.git  
**Canonical plan:** [ROADMAP.md](./ROADMAP.md) · [SPRINTS.md](./SPRINTS.md)

## Running

| Service | URL |
|---------|-----|
| UI | http://localhost:3000 |
| API | http://localhost:5000/health |
| Postgres | localhost:5433 |

Lab admin: `admin` / `admin123`

## Completed

- Phase 1 (Docker, env, API-key ingest, docs, DB migrate)  
- Secure Core (reset requests, temp password, TOTP, logout-on-401-only)  
- E2E **31/31 PASS**  
- Backend Hardening (modules, Umzug migrations, tests, logger)  
- **UX Mobile-first** — responsive shell/drawer, dialogs+snackbars (no prompt/confirm/alert), page/list motion + critical severity pulse, skeletons/empty states, teal/slate theme (DM Sans), Settings trimmed to in-app severity prefs

## Locked product decisions (see ROADMAP)

- Notifications = **in-app** (free); same model for optional mobile later  
- UI = **mobile-first**, dynamic, with purposeful animations  
- No email/SMS for auth; no paid push required for MVP  

## Sequence remaining

1. **Permissions + access requests**  
2. **In-app notifications**  
3. **Mobile client** (optional)  

## Still not done

- Permission-scoped alerts  
- Access-request workflow (group/server)  
- In-app notification center (bell)  
- Optional mobile client  
