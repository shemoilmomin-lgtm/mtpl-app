-- Migration: Beta v3.1.3 — add edited_at column to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
