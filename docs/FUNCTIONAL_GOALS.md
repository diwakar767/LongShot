# Functional Goals

LongShot (AlertOn) is a centralized alert reporting system: engineers ingest alerts from servers; admins manage inventory and visibility; users receive relevant notifications.

## FG-1 Alert ingest
- Accept alerts with message, severity (`trivial|minor|major|critical`), and name-based references to server, group, application, country.
- Authenticate ingest (API key for agents; JWT for admin UI create).
- Persist alerts with timestamps and foreign keys.
- Reject invalid severity or unknown reference names with actionable errors.

## FG-2 Reference data management
- CRUD for servers, applications, groups, users (admin).
- List countries (seeded / managed).
- Assign users to groups; define optional view permissions by country/app/group/server.

## FG-3 Alert visibility
- Authenticated users can list alerts with joined display fields.
- Filter by country, severity, application, group, server, and free-text search.
- Non-admins eventually see only permitted alerts (target; not wired yet).

## FG-4 Authentication and account recovery
- Username/password login issuing short-lived JWT.
- Admin vs non-admin capabilities.
- Password reset via **in-app request** + admin **temporary password** (no email/SMS).
- Optional **TOTP** (authenticator app) for login.

## FG-5 Auditability
- Record admin/mutating actions in an audit log.
- Admins can search and review recent actions.

## FG-6 Notifications (in-app, free)
- Persist severity preferences for which alerts notify.
- On ingest, create **in-app notifications** for eligible users.
- Users can list, see unread count, and mark notifications read (web; same API for optional mobile later).
- Track delivery state (`notification_sent` or notification rows).
- **No email/SMS/paid push required** for MVP.

## FG-7 Subscription / access requests (target)
- Users request access to groups/servers.
- Admins approve or reject; membership/permissions update accordingly.

## FG-8 Operations
- Health endpoint for API/database.
- Docker-based local/runtime stack.
- Documented backup and restore of PostgreSQL.

## FG-9 Experience (UX)
- **Mobile-first** responsive web UI.
- Dynamic feedback (loading, empty, errors).
- Purposeful animations (not decorative noise).
