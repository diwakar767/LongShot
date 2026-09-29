# AI / Agent Rules (LongShot)

These rules apply to humans and coding agents working in this repository.

## Product posture
- Prefer small, reversible changes over rewrites.
- Do not invent features that are not in `docs/USER_STORIES.md` / `docs/SPRINTS.md` without updating those docs first.
- Phase scope is sacred: if the active sprint is foundations, do not “just add” FCM or a visual redesign.

## Design / UX
- Do **not** produce generic AI UI: no purple-glow gradients, no emoji decoration, no card-soup dashboards for their own sake.
- Keep the existing MUI foundation unless a sprint explicitly calls for theme work.
- Prefer boring, readable admin UI. Match patterns already in `alerton-frontend/src/pages`.

## Security
- Never commit `.env`, `credentials.txt`, dumps, or real API keys/passwords.
- Use `.env.example` for documentation of variable names only.
- Alert ingest must remain authenticated (`X-API-Key` or JWT).
- Do not weaken auth “for convenience” in sample code.

## Code quality
- Match existing style (CommonJS backend, JSX frontend) until a sprint migrates tooling.
- Avoid drive-by refactors outside the task.
- No new dependencies without a clear need noted in the PR/commit body.
- Update `docs/STATUS.md` and `docs/TODO.md` when finishing a sprint item.

## Runtime
- Docker Compose is the default local path (not VirtualBox).
- Document any host-only steps (CLI, `pg_dump`) in README or STATUS.
- Leave the tree buildable: `docker compose up --build` should work after your change.

## Git
- Do not force-push `main` unless explicitly requested.
- Do not amend others’ commits.
- Commit messages explain *why*.

## Cursor-specific
- Follow this file and `.cursor/rules/longshot.mdc` when present.
- Prefer editing docs alongside behavior changes.
