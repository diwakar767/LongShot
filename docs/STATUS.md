# Project Status

**Last updated:** 2026-09-29  
**Active sprint next:** Backend Hardening  
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

## Locked product decisions (see ROADMAP)

- Notifications = **in-app** (free); same model for optional mobile later  
- UI = **mobile-first**, dynamic, with purposeful animations  
- No email/SMS for auth; no paid push required for MVP  

## Sequence remaining

1. **Backend Hardening**  
2. **UX Mobile-first + animations**  
3. **Permissions + access requests**  
4. **In-app notifications**  
5. **Mobile client** (optional)  

## Still not done

- Backend modularization / migrations  
- Mobile-first layout + motion  
- Permission-scoped alerts  
- Access-request workflow  
- In-app notification center  
- Optional mobile client  
