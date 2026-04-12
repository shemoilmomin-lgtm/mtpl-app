-- Migration: Beta v3.1 — reminders, notifications, task_reminder_sends
-- Run this on the production database if these tables do not yet exist.

CREATE TABLE IF NOT EXISTS notifications (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message           TEXT NOT NULL,
  is_read           BOOLEAN DEFAULT false,
  created_at        TIMESTAMP DEFAULT now(),
  entity_type       VARCHAR(20),
  entity_id         INTEGER,
  notification_type VARCHAR(50),
  sender_id         INTEGER
);

CREATE TABLE IF NOT EXISTS reminders (
  id           SERIAL PRIMARY KEY,
  task_id      INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id      INTEGER REFERENCES users(id),
  remind_at    TIMESTAMP NOT NULL,
  is_dismissed BOOLEAN DEFAULT false,
  created_at   TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_reminder_sends (
  id       SERIAL PRIMARY KEY,
  task_id  INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sent_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_to  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at  TIMESTAMP DEFAULT now()
);

-- Add missing columns to notifications if the table already exists but is outdated
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type       VARCHAR(20);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id         INTEGER;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id         INTEGER;
