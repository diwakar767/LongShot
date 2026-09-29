# Sprint Plan — Path to End Goal

Canonical decisions: **[ROADMAP.md](./ROADMAP.md)**.

```text
SecureCore (done)
  → BackendHardening          (done)
  → UXMobileFirst             (done)
  → PermissionsAccess         (next — scoped alerts + access requests)
  → InAppNotifications        (free notify MVP)
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

## Sprint Permissions + Access Requests — Next

- Wire permission/membership filtering on alerts  
- Group/server **access requests** (separate from password-reset Requests)  
- Admin approve/reject; Users UI group assignment  

---

## Sprint In-App Notifications (free)

**Goal:** Users learn about new alerts without email/SMS/paid push.

- Notification entity + APIs (list, unread count, mark read)  
- Create notifications on ingest for eligible users (respect severity prefs)  
- Bell + panel UI (mobile-first)  
- Settings severity toggles drive what notifies  
- Same contract later used by optional mobile client  

**Explicitly out:** Twilio, mandatory FCM, paid transactional email.

---

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
