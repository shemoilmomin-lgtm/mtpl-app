-- MTPL Order Management — PostgreSQL Schema
-- Run this in psql while connected to mtpl_db
-- Users table already exists — do not run users CREATE again
-- Passwords in users table are currently plaintext — hash them before go-live using bcryptjs

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  company_name VARCHAR(150),
  gst_number VARCHAR(50),
  contact_1_name VARCHAR(100),
  contact_1_no VARCHAR(20),
  contact_2_name VARCHAR(100),
  contact_2_no VARCHAR(20),
  contact_3_name VARCHAR(100),
  contact_3_no VARCHAR(20),
  contact_4_name VARCHAR(100),
  contact_4_no VARCHAR(20),
  accountant_name VARCHAR(100),
  accountant_no VARCHAR(20),
  email VARCHAR(150),
  address TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- QUOTATIONS (before orders — orders reference quotations)
-- ─────────────────────────────────────────
CREATE TABLE quotations (
  id SERIAL PRIMARY KEY,
  quotation_id VARCHAR(20) UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id INTEGER REFERENCES clients(id),
  subject TEXT,
  tax_mode VARCHAR(20) CHECK (tax_mode IN ('inclusive', 'exclusive')) DEFAULT 'exclusive',
  show_tax_details BOOLEAN DEFAULT TRUE,
  terms_and_conditions TEXT,
  signature_block BOOLEAN DEFAULT TRUE,
  discount_type VARCHAR(20) DEFAULT 'fixed',
  discount_amount NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  order_id INTEGER, -- FK added after orders table is created
  lead_id INTEGER,  -- FK added after leads table is created
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  manual_client_name TEXT,
  manual_client_address TEXT,
  manual_client_phone TEXT,
  manual_client_email TEXT,
  is_archived BOOLEAN DEFAULT FALSE
);

-- ─────────────────────────────────────────
-- QUOTATION LINE ITEMS
-- ─────────────────────────────────────────
CREATE TABLE quotation_items (
  id SERIAL PRIMARY KEY,
  quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
  item_name TEXT,
  description TEXT,
  quantity NUMERIC(10,2),
  rate NUMERIC(10,2),
  amount NUMERIC(10,2),
  sort_order INTEGER DEFAULT 0
);

-- ─────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(20) UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id INTEGER REFERENCES clients(id),
  job_type VARCHAR(100),
  quantity VARCHAR(100),
  specifications TEXT,
  delivery_expected DATE,
  quotation_ref_id INTEGER REFERENCES quotations(id),
  quotation_manual_no VARCHAR(100),
  quotation_manual_amount NUMERIC(10,2),
  advance NUMERIC(10,2) DEFAULT 0,
  balance NUMERIC(10,2) DEFAULT 0,
  prepared_by INTEGER REFERENCES users(id),
  status VARCHAR(50) CHECK (status IN (
    'negotiation', 'quotation', 'proforma', 'designing', 'review',
    'corrections', 'pre-press', 'printing', 'tax invoice',
    'invoice pending', 'ready at office', 'out for delivery',
    'waiting pickup', 'completed', 'long pending'
  )) DEFAULT 'negotiation',
  is_archived BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add FK from quotations to orders now that orders exists
ALTER TABLE quotations
  ADD CONSTRAINT fk_quotation_order
  FOREIGN KEY (order_id) REFERENCES orders(id);

-- ─────────────────────────────────────────
-- ORDER ASSIGNEES (multi-user assignment)
-- ─────────────────────────────────────────
CREATE TABLE order_assignees (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(order_id, user_id)
);

-- ─────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  client_id INTEGER REFERENCES clients(id),
  order_id INTEGER REFERENCES orders(id),
  status VARCHAR(20) CHECK (status IN ('open', 'completed')) DEFAULT 'open',
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TASK ASSIGNEES (multi-user assignment)
-- ─────────────────────────────────────────
CREATE TABLE task_assignees (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(task_id, user_id)
);

-- ─────────────────────────────────────────
-- COMMENTS (unified across all modules)
-- ─────────────────────────────────────────
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) CHECK (entity_type IN ('order', 'quotation', 'client', 'lead', 'task')),
  entity_id INTEGER,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- REMINDERS
-- ─────────────────────────────────────────
CREATE TABLE reminders (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  remind_at TIMESTAMP NOT NULL,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- LEADS
-- ─────────────────────────────────────────
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(20) UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id INTEGER REFERENCES clients(id),
  client_manual_name VARCHAR(150),
  client_manual_contact VARCHAR(50),
  job_type VARCHAR(100),
  quantity VARCHAR(100),
  specifications TEXT,
  delivery_expected DATE,
  entered_by INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'open',
  order_id INTEGER REFERENCES orders(id),
  converted_client_id INTEGER REFERENCES clients(id),
  is_archived BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add FK from quotations to leads now that leads exists
ALTER TABLE quotations
  ADD CONSTRAINT fk_quotation_lead
  FOREIGN KEY (lead_id) REFERENCES leads(id);

-- ─────────────────────────────────────────
-- LEAD QUOTATIONS (many-to-many)
-- ─────────────────────────────────────────
CREATE TABLE lead_quotations (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
  UNIQUE(lead_id, quotation_id)
);

-- ─────────────────────────────────────────
-- ACTIVITY LOGS
-- ─────────────────────────────────────────
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20),
  entity_id INTEGER,
  entity_label VARCHAR(100),
  action VARCHAR(50),
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ATTACHMENTS
-- ─────────────────────────────────────────
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) CHECK (entity_type IN ('order', 'lead', 'quotation')),
  entity_id INTEGER,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- SETTINGS
-- ─────────────────────────────────────────
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- MIGRATIONS (run if tables already exist)
-- ─────────────────────────────────────────
-- ALTER TABLE quotations ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
-- ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_entity_type_check;
-- ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS action VARCHAR(50);
-- ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS entity_label VARCHAR(100);