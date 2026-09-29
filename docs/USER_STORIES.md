# LongShot (AlertOn) — User Stories

Status legend: **Done** · **Partial** · **Planned**

Source: product PDF vision + current codebase (Phase 1 baseline).

---

## Engineer (CLI / ingest)

| ID | Story | Acceptance | Status |
|----|-------|------------|--------|
| US-E1 | As an engineer, I can send an alert with message, severity, server, group, app, and country via CLI | Flags + `config.yaml` defaults; HTTP POST succeeds | **Done** |
| US-E2 | As an engineer, I can dry-run an alert without hitting the server | `--dry-run` logs payload only | **Done** |
| US-E3 | As an engineer, I get clear errors and retries on failure | 3 attempts, error message from API | **Partial** (exit code improved in Phase 1) |
| US-E4 | As an engineer, I authenticate the CLI so only authorized agents can ingest | `X-API-Key` required on `POST /alert` | **Done** (Phase 1) |
| US-E5 | As an engineer, I can run the CLI against a Dockerized API without VMs | Documented URL `http://127.0.0.1:5000/alert` | **Done** (Phase 1) |

---

## Admin (web)

| ID | Story | Acceptance | Status |
|----|-------|------------|--------|
| US-A1 | As an admin, I can log in with username/password and receive a JWT | `POST /login` + UI login | **Done** |
| US-A2 | As an admin, I can CRUD servers, groups, users, and applications | REST + UI pages | **Done** |
| US-A3 | As an admin, I can view and filter alerts by country, server, app, group, severity | Alerts page filters | **Partial** (client-side only; no server pagination) |
| US-A4 | As an admin, I can search an audit log of actions | Audit page + `GET /audit` | **Done** |
| US-A5 | As an admin, I can create users with a temporary password | Generator in UI; no first-login forced change | **Partial** |
| US-A6 | As an admin, I can lock/unlock accounts | UI placeholders; no backend fields | **Planned** |
| US-A7 | As an admin, I can assign users to groups and set view permissions | Membership/permission APIs exist; UI incomplete; alert scoping broken | **Partial** |
| US-A8 | As an admin, I can configure which severities trigger notifications | Settings UI stub; no persistence | **Planned** |
| US-A9 | As an admin, I can approve or reject subscription requests | Requests page mock only | **Planned** |

---

## Regular user

| ID | Story | Acceptance | Status |
|----|-------|------------|--------|
| US-U1 | As a user, I can log in and change a temporary password | Login works; OTP reset exists; temp-password flow incomplete | **Partial** |
| US-U2 | As a user, I see only alerts for my approved groups/permissions | Permission-filtered `GET /alerts` unreachable | **Planned** |
| US-U3 | As a user, I can manage notification preferences by severity | Settings stub | **Planned** |
| US-U4 | As a user, I receive push/email for critical alerts | `notification_sent` unused; no FCM | **Planned** |
| US-U5 | As a user, I can request group subscriptions pending admin approval | Not implemented | **Planned** |
| US-U6 | As a user, I can use a mobile app offline with sync | React Native not started | **Planned** |

---

## System

| ID | Story | Acceptance | Status |
|----|-------|------------|--------|
| US-S1 | Secure communication between CLI and API | API key + env secrets; HTTPS still Planned | **Partial** |
| US-S2 | Local development without cloud cost | Docker Compose replaces VirtualBox | **Done** (Phase 1) |
| US-S3 | Process and filter large alert volumes | No pagination/indexes strategy yet | **Planned** |
| US-S4 | Backups with restore | Host→Docker dump/restore runbook | **Partial** (manual Phase 1) |
