# Sprint Plan — Path to End Goal

Canonical decisions: **[ROADMAP.md](./ROADMAP.md)**.

```text
SecureCore (done)
  → BackendHardening          (done)
  → UXMobileFirst             (done)
  → PermissionsAccess         (done)
  → InAppNotifications        (done)
  → AlarmLifecycle            (done)
  → MobileClient              (optional; same in-app model)
```

---

## Phase 1 — Docs, Docker, Foundations — Done

---

## Sprint Secure Core — Done

- No email/SMS auth; admin temp password + optional TOTP reset  
- Must-change-password; TOTP enroll/login  
- Change-token Bearer fix; 401-only logout interceptor  

---

## Sprint Backend Hardening — Done

- Split `server.js` into `app.js` + `routes/` + `middleware/` + `services/`  
- Umzug migrations; removed `sequelize.sync({ alter: true })`  
- Removed duplicate dead `GET /alerts` (kept joined formatter)  
- Structured JSON logger; tests: login, ingest API key, reset fulfill, change-password  

## Sprint UX — Mobile-first + dynamic + animations — Done

- Mobile-first responsive shell (temporary drawer on small screens; tables → cards)  
- Dialogs/snackbars instead of `prompt`/`confirm`/`alert`  
- Motion: page enter, list enter, critical severity pulse, drawer  
- Skeletons + empty states; Settings = local in-app severity prefs only  
- Theme: teal/slate + DM Sans (no purple-glow AI look); removed unused AlertTable/StatCard  

## Sprint Permissions + Access Requests — Done

- Wire permission/membership filtering on alerts (admins see all)  
- Group/server **access requests** API + `/access` UI (separate from password-reset Requests)  
- Admin approve/reject; Users UI group assignment  

## Sprint In-App Notifications (free) — Done

- Notification entity + APIs (list, unread count, mark read / read-all)  
- Create notifications on ingest for eligible users (scope + `notify_prefs`)  
- Bell + panel UI (popover desktop / bottom drawer mobile)  
- Settings severity toggles persisted server-side  

## Sprint Alarm Lifecycle + Retention — Done

- CLI: fingerprint state file beside binary; dedupe; `resolve_after_seconds` (N) → resolve API  
- Backend: active/resolved alerts; retention_days on servers & apps; prune resolved  
- UI: Active/Resolved on Alerts; retention fields on Servers/Applications  
- Agent heartbeat (15m interval, down after 30m): `POST /agent/heartbeat`; dashboard `x/y` live; Servers Live/Down colors  

## Sprint Mobile Client — Optional

- Thin app over existing REST + in-app notification inbox  
- No dependency on paid push for MVP mobile  
- Optional OS notifications only if later approved  

---

## Definition of Done (all sprints)

- Docs/`STATUS.md`/`ROADMAP.md` updated  
- Docker Compose works  
- No secrets committed  
- Decisions match ROADMAP  
