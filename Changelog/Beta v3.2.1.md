# Beta v3.2.1 — Changelog

Release date: 2026-04-12

---

## Bug fixes

### Order view crashing with "token is not defined"
Fixed a crash that occurred when opening any order in view mode. The `DetailsTab` component was not receiving the `token` and `isAdmin` props, causing the new inline invoice edit fields to throw a ReferenceError on render.

### Activity log messages vague and ungrammatical
Improved all activity log entries to be precise and readable:

- Comment posted: now shows a snippet of the comment text — `Added a comment: "…"`
- Comment edited: shows the updated text — `Edited a comment: "…"`
- Reminder sent: includes the recipient's name — `Sent a reminder to X for task: Y`
- All other actions (created, archived, trashed, etc.): now capitalized and use a colon before the label — e.g. `Created task: My Task`
