# Beta v3.1 — Changelog

Release date: 2026-04-12

---

## Comments

### Live sync within record views
Comments posted by other users now appear in real time inside the open record view (Orders, Tasks, Quotations, Clients, Leads) without needing a page refresh. This is powered by a new `entity_comment` SSE broadcast that fires to all connected users whenever a comment is saved, with each client filtering by the currently open record.

### Live sync in Recent Comments feed
The Recent Comments feed (activity panel in the sidebar) now live-syncs comments from a broader set of records:

- Records where you are an **assignee** (orders, tasks) — was already working
- Records you **created** (`prepared_by` for orders, `created_by` for tasks and quotations) — newly added
- Comments that **@mention** you anywhere — was already working

The server-side feed query and SSE push logic were both updated to include these creator-based conditions across all entity types.

### Comment deletion
- **Superadmins** can permanently delete any comment at any time.
- **Comment authors** can delete their own comment within 30 minutes of posting.
- All other users have no delete access.

---

## Notifications

### Notifications module added
A new Notifications panel is available in the sidebar (bell icon). It shows task-related notifications in real time via SSE and persists them in the database for up to 30 days.

Supported actions:
- Mark all notifications as read
- Clear all notifications

### Task notifications — all fields covered
Notifications are now sent to all assignees and the task creator whenever any of the following fields change on a task:

| Field | Notification type | Message |
|---|---|---|
| Title | `title_changed` | Task renamed from "Old" to "New" |
| Status | `status_changed` | Task status changed to Working (etc.) |
| Description | `description_changed` | Task description was updated |
| Linked client | `linked_client_changed` | Linked client changed / removed |
| Linked order | `linked_order_changed` | Linked order changed / removed |
| Assignees (new) | `assigned` | You have been assigned to task "..." |

Previously only status and description changes triggered notifications. The description change notification also had a bug where clearing the description would silently skip the notification — this is now fixed.

Each notification type has a distinct icon and color in the panel.

### New task — assignment notification
When a new task is created with assignees, all assigned users receive an `assigned` notification immediately.

---

## Reminders

### Reminders module added
Users can set reminders on tasks. When a reminder is due, the assigned user receives a `reminder` notification (bell icon, orange) via the Notifications panel.

---

## Bug fixes

### "In Queue" status not saving correctly
Fixed an issue where saving a task with status `in_queue` was not being persisted correctly. A validation check now ensures only valid statuses (`in_queue`, `working`, `waiting`, `done`) are accepted, defaulting to `in_queue` if an unrecognized value is submitted.

---

## Infrastructure

### SSE broadcast (`pushToAll`)
Added a `pushToAll` utility to the SSE client registry. This broadcasts a named event to every currently connected user, enabling the within-record live comment sync described above without needing to track which users are viewing which records.
