# Beta v3.3 — Changelog

Release date: 2026-04-12

---

## New features

### Global search
A search bar is now available in the top bar on all screens. It searches across every entity and field — clients (name, company, phone, email), orders (project name, job ID, job type, notes), quotations (number, subject, client name), quotation line items (item name, description), tasks (title, description), leads (title, company, contact, description), and comments. Results are grouped by type and clicking any result navigates directly to that record. On mobile, tap the search icon in the top bar to open a full-screen search overlay.

---

## Changes

### Quotation numbering changed to MTPLQ-xxxx
Quotation numbers now use the format `MTPLQ-0001` instead of `QT-0001`. The numbering continues from the last number used across both old and new formats, so no numbers are skipped or duplicated.

### Quotation PDF: INR replaced with ₹ symbol
The total section of the downloadable PDF now shows `₹` instead of `INR` before the amount.

### Orders: only company name shown in list and view
Contact name has been removed from the orders list and table view. Only the company name is shown (falling back to contact name if no company name is set).

---

## Bug fixes

### Mobile: comment field no longer zooms in on tap
Inputs and textareas on mobile now use a minimum font size of 16px, which prevents iOS Safari from auto-zooming when a field is focused.
