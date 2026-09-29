# Sprint Plan — Path to End Goal

Methodology: short Agile sprints. Phase 1 is complete when docs, Docker, DB migration, and security foundations land on `main`.

```text
Phase1 → SecureCore → BackendHardening → UXPolish → NotifyEmail → RequestsPermissions → FCM/Mobile(optional)
```

---

## Phase 1 — Docs, Docker, Foundations (current)

**Goal:** Product home on LongShot; reproducible local stack; secrets out of code; authenticated ingest.

**Deliverables:**
- Documentation pack (`USER_STORIES`, goals, `ARCHITECTURE`, this file, `TODO`, `STATUS`, `AIRULES`)
- Docker Compose (postgres, backend, frontend)
- Host Postgres dump → Docker restore
- Env-based `DATABASE_URL`, `JWT_SECRET`, CORS, API URL
- `X-API-Key` on `POST /alert` + CLI support
- `.gitignore` / scrub credentials

**Exit criteria:** `docker compose up` works; migrated data visible; CLI with key succeeds; without key fails.

---

## Sprint Secure Core

**Goal:** Close obvious auth/session holes without a rewrite.

- Bound password-reset to verified OTP (one-time reset token)
- Frontend axios instance + 401 → logout
- Confirm JWT expiry handling; never hardcode secrets
- Rate-limit login / forgot-password (light)
- Document HTTPS termination for any shared deploy

**Stories:** US-U1 harden, US-S1

---

## Sprint Backend Hardening

**Goal:** Maintainable backend and safer schema evolution.

- Split `server.js` into routes/controllers/services
- Replace `sync({ alter: true })` with Sequelize migrations (or SQL migrations)
- Structured logging (request id, level)
- Expand `/health`; add readiness if useful
- Smoke/unit tests for login + ingest auth
- Remove dead duplicate `GET /alerts` handler as prep for permissions

**Stories:** NF-2, NF-3, NF-6

---

## Sprint UX Polish (measured)

**Goal:** Human, restrained UI — not a redesign for its own sake.

- Refine existing MUI theme (avoid generic AI purple/glow tropes)
- Replace `window.prompt` / `confirm` / raw `alert` with dialogs/snackbars
- Decide: implement or remove Requests/Settings stubs (no fake buttons)
- Delete unused components/deps (`StatCard`, `AlertTable`, unused packages)
- Client pagination note → plan server pagination if lists grow

**Stories:** US-A3, NF-4

---

## Sprint Notify (Email)

**Goal:** Deliver on the product promise of “someone gets notified.”

- Persist severity notification settings (replace Settings stub)
- On ingest, resolve group members / eligible users and send email
- Set `notification_sent` (or delivery log table)
- Admin audit for notify failures

**Stories:** US-A8, US-U3, US-U4 (email path), FG-6

---

## Sprint Requests + Permissions

**Goal:** Scoped visibility and subscription workflow.

- Fix alert listing to honor `UserPermission` / memberships
- Requests API + real UI for approve/reject
- Wire user group assignment in Users UI
- Lock/temp-password fields if still required by stories

**Stories:** US-A7, US-A9, US-U2, US-U5, FG-3, FG-7

---

## Sprint FCM / Mobile (optional)

**Goal:** Push + mobile only after email notify + permissions work.

- Firebase admin on backend; device token registration
- React Native or Expo client for login, alert list, prefs
- Offline cache only if still justified

**Stories:** US-U4 (push), US-U6

---

## Definition of Done (all sprints)

- Docs/`STATUS.md` updated
- No secrets committed
- Works via Docker Compose
- Backward-compatible CLI flags where possible
- Reviewable PR / commit message explaining *why*
