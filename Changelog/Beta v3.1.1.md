# Beta v3.1.1 — Changelog

Release date: 2026-04-12

---

## Bug fixes

### Reminders not firing

Fixed an issue where task reminders were saved to the database but never delivered. A server-side scheduler now runs every 60 seconds, checks for due reminders, and for each one:

- Inserts a `reminder` notification into the notifications table (persisted for 30 days)
- Pushes a live SSE notification to the assigned user's Notifications panel
- Marks the reminder as dismissed so it only fires once
