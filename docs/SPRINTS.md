# Sprint Plan — Path to End Goal

Canonical decisions: **[ROADMAP.md](./ROADMAP.md)**.

```text
SecureCore (done)
  → BackendHardening          (next)
  → UXMobileFirst             (mobile-first + animations + dynamic UX)
  → PermissionsAccess         (scoped alerts + access requests)
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

## Sprint Backend Hardening — Next

- Split `server.js` into routes/services  
- Real migrations; stop prod `alter: true`  
- Remove duplicate dead `GET /alerts`  
- Tests: login, ingest API key, reset fulfill, change-password  

**Why before UX:** clean APIs/schema make notification + permission work safer.

---

## Sprint UX — Mobile-first + dynamic + animations

**Goal:** Web app feels modern and usable on phones first; desktop remains solid.

- Mobile-first responsive shell (nav, tables → stacked cards/lists)  
- Dialogs/snackbars instead of `prompt`/`confirm`/`alert`  
- Consistent motion: page/list transitions, severity pulse/highlight, drawer  
- Dynamic UX: loading skeletons, empty states, clear pending actions  
- Restrained theme (no AI-slop)  
- Dead code cleanup; Settings trimmed for upcoming in-app prefs  

---

## Sprint Permissions + Access Requests

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
