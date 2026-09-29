# Project Status

**Last updated:** 2026-09-29  
**Active sprint next:** UX Mobile-first + animations  
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
- **Backend Hardening** — modular routes/middleware/services, Umzug migrations (no `alter: true`), duplicate `GET /alerts` removed, structured logger, `npm test` (login / ingest / reset+change-password)

## Locked product decisions (see ROADMAP)

- Notifications = **in-app** (free); same model for optional mobile later  
- UI = **mobile-first**, dynamic, with purposeful animations  
- No email/SMS for auth; no paid push required for MVP  

## Sequence remaining

1. **UX Mobile-first + animations**  
2. **Permissions + access requests**  
3. **In-app notifications**  
4. **Mobile client** (optional)  

## Still not done

- Mobile-first layout + motion  
- Permission-scoped alerts  
- Access-request workflow  
- In-app notification center  
- Optional mobile client  

## Backend notes

- Boot: `migrate.js` (Umzug) then `app.listen` — see `alerton-backend/server.js`  
- Tests: from `alerton-backend`, with Compose Postgres up and `.env` loaded: `npm test`  
- Fresh DBs get schema from `migrations/001-initial-schema.js`; existing volumes skip creates if `Users` already exists  
