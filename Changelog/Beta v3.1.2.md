# Beta v3.1.2 — Changelog

Release date: 2026-04-12

---

## Infrastructure

### Production database migration

Added migration script `migrations/v3.1_reminders_notifications.sql` to create the `reminders`, `notifications`, and `task_reminder_sends` tables on the production database, along with any missing columns on `notifications`. This resolves the 500 errors on reminder and notification endpoints.
