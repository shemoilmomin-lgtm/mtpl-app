# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Client (from /client)
npm run dev        # Vite dev server
npm run build      # Production build
npm run lint       # ESLint

# Server (from /server)
npm run dev        # nodemon (auto-restart)
npm start          # node index.js

# Full production build (from root)
npm run build      # installs deps + builds client
npm start          # serves via Express on port 3001
```

### Database
- Local DB: PostgreSQL, database `mtpl_db`, user `ertekaaz`
- Schema lives in `schema.sql` (full dump) and incremental migrations in `migrations/`
- Apply a migration manually: `psql -d mtpl_db -f migrations/<file>.sql`
- One-time data migration script: `node server/migrate.js` (reads JSON from `server/data/`)

## Architecture

This is a monorepo: `client/` (React SPA) and `server/` (Express API) deployed together — Express serves the built client from `client/dist/`.

### Server (`server/`)
- **Entry**: `index.js` — mounts all routers under `/api/*`, serves static client build, runs the reminder scheduler (60s interval)
- **Pattern**: thin routes in `routes/` call inline SQL via `pool` (no ORM). Controllers don't exist as a separate layer — logic lives in route files directly.
- **Auth**: JWT via `middleware/auth.js`. Token stored in `localStorage` as `mtpl_token`. All routes require `authenticate` middleware except `/api/auth`.
- **Real-time**: SSE (Server-Sent Events) via `config/sseClients.js`. The client connects to `/api/comments/stream`. Events: `comment`, `notification`, `presence`.
- **Activity logging**: `helpers/logActivity.js` exports `logActivity()` and `buildDiff()`. Every mutating route should call `logActivity` after the DB write.
- **File storage**: Cloudflare R2 via AWS SDK (`config/r2.js`, `config/r2Utils.js`). Multer handles multipart uploads.
- **Env vars needed**: `DATABASE_URL` (or `DB_HOST/PORT/NAME/USER/PASSWORD`), `JWT_SECRET`, R2 credentials, `PORT`.

### Client (`client/`)
- **Stack**: React 19, React Router v7, Tailwind CSS v3, shadcn/ui components (Radix-based), Lucide icons
- **Path alias**: `@/` resolves to `client/src/`
- **Auth**: `AuthContext` stores user + token in `localStorage` (`mtpl_token`, `mtpl_user`). `useAuth()` hook everywhere.
- **Layout**: `AppShell` wraps all protected pages — contains sidebar nav, mobile bottom nav, global search bar, activity feed panel, and notifications panel. New records are triggered via `navigate(path, { state: { openCreate: true } })`.
- **UI components**: shadcn/ui components live in `client/src/components/ui/`. Use `cn()` from `lib/utils.js` for class merging (clsx + tailwind-merge).
- **Icons**: Lucide React only. Never use emojis in UI.
- **API calls**: All fetch calls use relative `/api/...` paths with `Authorization: Bearer <token>` header. No API client library — raw `fetch()` throughout.

### Database schema (PostgreSQL)
Core tables: `users`, `clients`, `orders`, `quotations`, `quotation_items`, `tasks`, `leads`, `comments`, `attachments`, `activity_logs`, `notifications`, `reminders`, `settings`, `order_assignees`, `task_assignees`, `lead_quotations`.

Key conventions:
- `is_archived` / `is_deleted` flags for soft delete (archived = hidden from main views; deleted = trash)
- `entity_type` + `entity_id` polymorphic FK pattern used in `comments`, `attachments`, `activity_logs`, `notifications`
- Date columns use `date` type (not timestamp); `pg` is configured to return date strings as-is (`types.setTypeParser(1082, val => val)`)
- Roles: `user`, `admin`, `superadmin` — admin sees archived; superadmin sees trash and activity log

### User roles
- `user` — standard access
- `admin` — can see Archived section
- `superadmin` — can see Archived, Activity Log, and Trash

## Key patterns

- **No emojis** anywhere — use Lucide icons for visual elements
- **Before adding a column**: run `\d tablename` in psql to confirm what exists, then write a migration SQL file
- **Activity logging**: always call `logActivity()` after any create/update/delete in a route handler
- **SSE push**: after writes that other users should see live, call `pushToAll()` or `pushToUser()` from `config/sseClients`
