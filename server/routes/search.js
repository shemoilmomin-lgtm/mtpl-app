const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ results: [] });

  const like = `%${q}%`;

  try {
    const [clients, orders, quotations, tasks, leads, comments, qItems] = await Promise.all([
      pool.query(
        `SELECT 'client' as type, c.id::text, c.full_name as label, c.company_name as subtitle
         FROM clients c
         WHERE (c.full_name ILIKE $1 OR c.company_name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1)
           AND c.is_trashed = false
         LIMIT 5`,
        [like]
      ),
      pool.query(
        `SELECT 'order' as type, o.id::text, o.project_name as label,
                COALESCE(c.company_name, c.full_name) as subtitle, o.job_id
         FROM orders o LEFT JOIN clients c ON c.id = o.client_id
         WHERE (o.project_name ILIKE $1 OR o.job_id ILIKE $1 OR o.job_type ILIKE $1 OR o.notes ILIKE $1)
           AND o.is_trashed = false
         LIMIT 5`,
        [like]
      ),
      pool.query(
        `SELECT 'quotation' as type, q.id::text, q.quotation_id as label,
                COALESCE(c.company_name, c.full_name, q.manual_client_name) as subtitle
         FROM quotations q LEFT JOIN clients c ON c.id = q.client_id
         WHERE q.quotation_id ILIKE $1 OR q.subject ILIKE $1 OR q.manual_client_name ILIKE $1
         LIMIT 5`,
        [like]
      ),
      pool.query(
        `SELECT 'task' as type, t.id::text, t.title as label, t.description as subtitle
         FROM tasks t
         WHERE (t.title ILIKE $1 OR t.description ILIKE $1)
           AND t.is_trashed = false
         LIMIT 5`,
        [like]
      ),
      pool.query(
        `SELECT 'lead' as type, l.id::text, l.title as label,
                COALESCE(l.company_name, l.contact_name) as subtitle
         FROM leads l
         WHERE (l.title ILIKE $1 OR l.company_name ILIKE $1 OR l.contact_name ILIKE $1 OR l.description ILIKE $1)
           AND l.is_trashed = false
         LIMIT 5`,
        [like]
      ),
      pool.query(
        `SELECT 'comment' as type, cm.id::text, cm.message as label,
                cm.entity_type, cm.entity_id::text as entity_id
         FROM comments cm
         WHERE cm.message ILIKE $1
         LIMIT 5`,
        [like]
      ),
      pool.query(
        `SELECT 'quotation_item' as type, q.id::text as id, qi.item_name as label,
                qi.description as subtitle, q.quotation_id as quot_label
         FROM quotation_items qi JOIN quotations q ON q.id = qi.quotation_id
         WHERE qi.item_name ILIKE $1 OR qi.description ILIKE $1
         LIMIT 5`,
        [like]
      ),
    ]);

    const results = [];

    if (clients.rows.length) results.push({ section: 'Clients', items: clients.rows });
    if (orders.rows.length) results.push({ section: 'Orders', items: orders.rows });
    if (quotations.rows.length) results.push({ section: 'Quotations', items: quotations.rows });
    if (tasks.rows.length) results.push({ section: 'Tasks', items: tasks.rows });
    if (leads.rows.length) results.push({ section: 'Leads', items: leads.rows });
    if (comments.rows.length) {
      results.push({
        section: 'Comments',
        items: comments.rows.map(r => ({
          ...r,
          label: r.label.length > 80 ? r.label.slice(0, 80) + '…' : r.label,
          subtitle: `in ${r.entity_type}`,
        })),
      });
    }
    if (qItems.rows.length) {
      results.push({
        section: 'Quotation Items',
        items: qItems.rows.map(r => ({ ...r, subtitle: r.quot_label })),
      });
    }

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
