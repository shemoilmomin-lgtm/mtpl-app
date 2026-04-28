# Beta v3.2.2 — Changelog

Release date: 2026-04-12

---

## Bug fixes

### Enter key not creating a new line in comments
The comment input was using a single-line `<input>` element inside the `MentionInput` component, which cannot display multiple lines. Switched to a `<textarea>` with auto-resize so the field grows as the user types. Enter now inserts a new line as expected; Cmd/Ctrl+Enter still sends the comment.
