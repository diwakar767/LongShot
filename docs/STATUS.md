# Project Status

**Last updated:** 2026-09-29  
**Active sprint next:** In-app notifications  
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

- Phase 1 · Secure Core · Backend Hardening · UX Mobile-first  
- **Permissions + access requests** — scoped `GET /alerts` (admin=all; else group membership + `UserPermission`); `AccessRequest` API/UI (`/access`); Users group assign/remove  

## Locked product decisions (see ROADMAP)

- Notifications = **in-app** (free)  
- UI = mobile-first + purposeful motion  
- No email/SMS for auth; no paid push required for MVP  

## Sequence remaining

1. **In-app notifications**  
2. **Mobile client** (optional)  

## Still not done

- In-app notification center (bell)  
- Optional mobile client  
