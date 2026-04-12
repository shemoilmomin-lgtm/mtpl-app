# Stable v3 — Changelog

Release date: 2026-04-13

---

## New features

### Bottom navigation bar (mobile)
A persistent bottom bar is now visible on mobile with quick access to Dashboard, Orders, Tasks, and Leads. The active tab is highlighted based on the current page.

### PWA — Add to Home Screen
The app is now installable as a Progressive Web App on iPhone and Android. Open the app in Safari, tap the share icon, and choose "Add to Home Screen." The app will launch in full-screen standalone mode with no browser chrome.

### App update button (mobile)
A new "Update App" button appears in Settings on mobile when a new version is available. Tapping it applies the update and reloads — no need to manually clear cache or reinstall.

### MTPL logo in sidebar
The sidebar and mobile top bar now display the full MTPL logo instead of plain text. The logo automatically adapts to light and dark mode.

### Delivery Calendar
The calendar widget on the Dashboard is now a functional Delivery Calendar. Dates with orders that have a delivery date set show a colored count badge (blue = 1, amber = 2, red = 3+). Tapping a date expands a list of deliveries for that day; tapping an order opens it directly.

### Dashboard — everything is clickable
All items on the Dashboard now navigate to the relevant page or record:
- Stat cards (Open Tasks, In Progress, Active Orders, Open Leads, Quotations) navigate to the respective section
- Recent Orders rows open the specific order
- My Tasks rows open the specific task
- Recent Leads rows open the specific lead
- Delivery Calendar dots open the specific order

### Global search — deep linking
Clicking any result in the global search bar now opens the specific record directly, not just the list page. Works for all entity types: Orders, Tasks, Clients, Leads, and Quotations.

### Orders — advanced filters and sorting
A "Filters" button next to the search bar in Orders reveals a filter panel with:
- Assignee
- Job Type
- Proforma (filled / empty)
- Tax Invoice (filled / empty)
- Date range (from / to)
- Sort by: Job ID, Date, Status, or Client
- Sort direction: ascending or descending

An indicator dot on the Filters button shows when any filter is active. A "Clear filters" button resets all at once.

### Feedback in Settings
All users now have a Feedback tab in Settings where they can submit a message with up to 3 file attachments. Admin and superadmin users see a Feedbacks tab listing all submissions with links to any attached files.

### Version number in Settings
The Settings page now shows the current version number at the bottom.

---

## Changes

### Attachments open in browser
Clicking an attachment now opens it in a new browser tab for supported formats (images, PDFs, video, audio, plain text). Other formats such as `.xls` and `.docx` continue to download as before.

### Sidebar — logo centered and enlarged
The logo in the sidebar is now centered and larger for a cleaner look.

---

## Bug fixes

### Sidebar active state on programmatic navigation
Navigating to Orders, Tasks, or Leads via dashboard links or search results now correctly expands and highlights the matching section in the sidebar. Previously the collapsible sections only tracked direct sidebar clicks.

### Calendar — padding cells incorrectly highlighted
The empty cells before the 1st of the month were showing as selected/highlighted due to a `null === null` comparison with the initial selected day state. Fixed.

### Orders filter panel crash
Opening the filter panel crashed the page with `A <Select.Item /> must have a value prop that is not an empty string`. Fixed by using a `_all` sentinel value instead.

### Quotation create form not opening from other pages
Navigating to Quotations with `openCreate` state from another page now reliably opens the create form. The dependency array was corrected.

### Quotation date field overflow on mobile
The date input in the quotation create form no longer overflows its container on small screens.
