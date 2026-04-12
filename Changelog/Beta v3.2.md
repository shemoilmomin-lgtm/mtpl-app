# Beta v3.2 — Changelog

Release date: 2026-04-12

---

## Features

### Activity tab in task view
Task view now has an Activity tab (previously missing), showing a full timeline of actions taken on the task — same as the existing activity tab in order view.

### Comment editing
Users can edit their own comments within 2 hours of posting. Admins can edit any comment at any time. Edited comments show an "(edited)" label. All edits are logged in the activity log.

### Invoice numbers inline editable in order view
Proforma and Tax Invoice numbers now have a pencil icon in order view mode. Clicking it shows an inline input to update the value without opening the full edit form. Available to admins only.

### View task button in notifications
Task-related notifications in the Notifications panel now include a "View task" link that navigates directly to the task and opens its view.

### Order number clickable in task view
The linked order number shown in the task details tab is now a clickable link that opens the order's view.

### Task view defaults to Comments tab
The task view now opens on the Comments tab instead of Details.

### Reminders logged in activity
When an admin sends a manual reminder, it is now logged in the task's activity log.

---

## Bug fixes

### File attachments in task comments not opening correctly
Attachment chips in task comments were linking directly to the API endpoint, which returns JSON. Fixed to use the same presigned URL fetch pattern as order comments — clicking an attachment now opens the file correctly.

### Comment delete/edit time windows using wrong timezone
The 30-minute delete window and 2-hour edit window were being calculated against a timestamp without timezone, causing incorrect results. Fixed by appending UTC offset before comparison.

---

## Migration required

Run on production database:

```sql
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
```
