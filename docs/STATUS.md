# Project Status

**Last updated:** 2026-09-29  
**Active sprint next:** Mobile client (optional)  
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

- Phase 1 · Secure Core · Backend Hardening · UX Mobile-first · Permissions + access  
- **In-app notifications** — `Notification` + prefs APIs; fan-out on ingest (scope + severity); navbar bell/panel; Settings prefs persisted server-side  
- **Alarm lifecycle + retention** — fingerprint open/reassert/resolve; CLI `alert-state.json` + `resolve_after_seconds`; per-server/app retention in admin UI; Active/Resolved alerts  
- **Agent heartbeat** — 15m interval / 30m stale; dashboard `x/y` agents live; Servers Live/Down coloring  

## Locked product decisions (see ROADMAP)

- Notifications = **in-app** (free); no email/SMS/FCM required  
- UI = mobile-first + purposeful motion  
- Fingerprint = sha256(severity|server|app|group|normalized message)  
- CLI state beside binary; N quiet seconds per deployment config  
- Retention days editable on Servers / Applications  
- CLI ingest auth = shared `X-API-Key` (`ALERT_INGEST_API_KEY`); proves possession of the ingest secret, not cryptographic binding of `server_name` to a host (see README / STATUS)  

## Sequence remaining

1. **Mobile client** (optional)  

## Still not done

- Optional dedicated mobile client (same notification APIs)  
