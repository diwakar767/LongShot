# LongShot — Finalized Product & Technical Decisions

**Date:** 2026-09-29 (revised)  
**Status:** Locked for remaining sprints (change only via explicit decision)

---

## Product end state

LongShot is a **self-hosted, free-to-run alert reporting system**:

1. Engineers/agents **ingest alerts** (CLI → API).
2. Admins **manage inventory** and **review alerts/audit**.
3. Users get **scoped visibility** and **in-app notifications**.
4. UI is **mobile-first**, dynamic, with purposeful motion.
5. Optional native/mobile client later **reuses the same in-app notification model** (no paid push required).

---

## Locked decisions

| Area | Decision |
|------|----------|
| Runtime | **Docker Compose** (postgres + backend + frontend). No VirtualBox as primary path. |
| Cost | **No paid SaaS** for core product. No email/SMS for auth. |
| Password recovery | User **requests reset** → admin **temp password** (+ optional **TOTP reset**) → user **changes password** → TOTP enroll. |
| Alert ingest auth | **`X-API-Key`** (CLI) or **JWT** (admin UI). |
| UI auth | **JWT** (1h), secret from env. |
| Database | **PostgreSQL 15**; Sequelize now → **migrations** in Backend Hardening. |
| Notifications | **In-app only** (bell / inbox / unread). Free. Same model for optional mobile later. **No Twilio/SMS. No mandatory FCM/email.** |
| UI / UX | **Mobile-first** responsive layout; **dynamic** UI (live feedback, loading/empty states); **subtle animations** (page/list transitions, alert emphasis) — not decorative AI-slop. Keep **MUI**. |
| Mobile client | **Optional later**; consumes same APIs + in-app notification store. |
| Repo | **https://github.com/diwakar767/LongShot** |

---

## Current capability map

### Done (Phase 1 + Secure Core)

| Capability | State |
|------------|--------|
| CLI → `POST /alert` (API key) | Done |
| Admin CRUD + alerts + audit | Done |
| Docker + DB migrate + env secrets | Done |
| Password reset request / temp password / TOTP | Done |
| Axios 401-only logout | Done |
| Email OTP | Retired (410) |
| E2E suite (31/31) | Done |
| Maintainable backend (modules + migrations) | Done |
| Mobile-first layout + animations | Done |

### Not done yet

| Capability | State |
|------------|--------|
| In-app notification center | Planned (Notify sprint) |
| Permission-scoped alerts | Broken/unwired |
| Group/server access requests | Not built |
| Settings severity prefs | Stub (will drive in-app notify prefs) |
| Optional mobile client | Later |

---

## Roadmap to end (ordered)

```text
SecureCore (done)
  → BackendHardening (done)
  → UXMobileFirst (done)
  → Permissions+AccessRequests — next
  → InAppNotifications (MVP notify — free)
  → MobileClient (optional; same in-app model)
```

### 1) Secure Core — Done
Auth recovery without email/SMS; TOTP; session fixes.

### 2) Backend Hardening — Done
- Split `server.js` into routes/services  
- Real migrations; drop prod reliance on `alter: true`  
- Remove duplicate `GET /alerts`  
- Tests: login, ingest key, reset fulfill, change-password  

### 3) UX — Mobile-first + dynamic + animations — Done
- Responsive **mobile-first** shell (nav, tables → cards/lists on small screens)  
- Replace `prompt`/`confirm`/`alert` with dialogs/snackbars  
- Purposeful motion: list enter, severity pulse/highlight, drawer/nav transitions (2–3 consistent patterns)  
- Dynamic feedback: loading skeletons, empty states, optimistic/disabled actions  
- Theme cleanup (human, restrained — no purple-glow AI look)  
- Dead component/dep cleanup  
- Settings stub: keep only what feeds later in-app prefs, or remove noise  

### 4) Permissions + access requests — Next
- Wire `UserPermission` / memberships into alert listing  
- Access requests (group/server) separate from password-reset requests  
- Users UI: real group assignment  

### 5) In-app notifications (free MVP notify)
- On alert ingest (and key admin events), create **Notification** rows for eligible users  
- API: list / mark-read / unread count  
- UI: notification bell + panel (mobile-friendly)  
- Severity prefs in Settings drive what creates notifications  
- Update `notification_sent` (or replace with delivery log)  
- **No email/SMS/FCM required**  

### 6) Mobile client (optional)
- Thin client over existing APIs  
- **In-app notification inbox** (same backend) — not paid push  
- Optional later enhancement: OS local notifications / FCM only if explicitly chosen  

---

## Explicit non-goals (near/medium term)

- Microservices / K8s  
- Paid SMS OTP  
- Mandatory cloud push or paid email for core flows  
- Full framework rewrite  

---

## Definition of “project complete” (MVP end)

1. Secure Docker deploy  
2. Authenticated ingest  
3. Admin inventory + alerts + audit  
4. Admin-mediated recovery + TOTP  
5. **Mobile-first** web UI with solid motion/dynamic UX  
6. Permission-scoped visibility + access requests  
7. **In-app notifications** with severity prefs  
8. Maintainable backend (modules + migrations)  

**Optional:** dedicated mobile client using the same notification APIs.
