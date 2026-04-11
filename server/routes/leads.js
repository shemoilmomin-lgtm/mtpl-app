const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const logActivity = require("../helpers/logActivity");
const { buildDiff } = require("../helpers/logActivity");

// Get trashed leads (superadmin only)
router.get("/trashed", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const result = await pool.query("SELECT * FROM leads WHERE is_deleted = TRUE ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all leads
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM leads WHERE is_deleted = FALSE ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create or update lead
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    client_id,
    client_manual_name,
    client_manual_contact,
    job_type,
    quantity,
    specifications,
    delivery_expected,
    entered_by,
    status,
  } = req.body;

  try {
    if (id) {
      const existing = await pool.query("SELECT * FROM leads WHERE id=$1", [id]);
      const old = existing.rows[0];
      const lead_label = old?.lead_id;

      await pool.query(
        `UPDATE leads SET
          client_id=$1, client_manual_name=$2, client_manual_contact=$3,
          job_type=$4, quantity=$5, specifications=$6,
          delivery_expected=$7, status=$8
        WHERE id=$9`,
        [client_id, client_manual_name, client_manual_contact, job_type, quantity, specifications, delivery_expected, status, id]
      );
      const diff = buildDiff(old, req.body, [
        { key: 'status', label: 'Status' },
        { key: 'job_type', label: 'Job Type' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'delivery_expected', label: 'Delivery', type: 'date' },
        { key: 'specifications', label: 'Specs' },
      ]);
      await logActivity({ userId: req.user.id, action: "edited", entityType: "lead", entityId: id, entityLabel: lead_label, message: diff || 'Saved with no changes' });
      res.json({ success: true });
    } else {
      const countResult = await pool.query("SELECT COUNT(*) FROM leads");
      const count = parseInt(countResult.rows[0].count) + 1;
      const lead_id = `LEAD-${String(count).padStart(4, "0")}`;

      const result = await pool.query(
        `INSERT INTO leads (lead_id, client_id, client_manual_name, client_manual_contact, job_type, quantity, specifications, delivery_expected, entered_by, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *`,
        [lead_id, client_id, client_manual_name, client_manual_contact, job_type, quantity, specifications, delivery_expected, entered_by, status]
      );
      const newLead = result.rows[0];
      await logActivity({ userId: req.user.id, action: "created", entityType: "lead", entityId: newLead.id, entityLabel: lead_id });
      res.json(newLead);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Archive lead
router.post("/archive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT lead_id FROM leads WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE leads SET is_archived=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "archived", entityType: "lead", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.lead_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Unarchive lead (restore)
router.post("/unarchive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT lead_id FROM leads WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE leads SET is_archived=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "lead", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.lead_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Trash lead (superadmin only)
router.post("/trash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT lead_id FROM leads WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE leads SET is_deleted=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "trashed", entityType: "lead", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.lead_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Untrash lead (superadmin only)
router.post("/untrash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT lead_id FROM leads WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE leads SET is_deleted=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "lead", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.lead_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Permanently delete lead (superadmin only)
router.post("/permanent-delete/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT lead_id FROM leads WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "deleted", entityType: "lead", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.lead_id });
    await pool.query("DELETE FROM leads WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Convert lead
router.post("/convert/:id", authenticate, async (req, res) => {
  const { convertTo } = req.body;
  try {
    const leadResult = await pool.query("SELECT * FROM leads WHERE id=$1", [req.params.id]);
    if (leadResult.rows.length === 0) return res.status(404).json({ error: "Lead not found" });

    const lead = leadResult.rows[0];
    const response = {};

    if (convertTo.includes("client")) {
      const client = await pool.query(
        `INSERT INTO clients (client_id, full_name)
        VALUES ($1,$2) RETURNING *`,
        [`CLT-${Date.now()}`, lead.client_manual_name || ""]
      );
      await pool.query("UPDATE leads SET converted_client_id=$1 WHERE id=$2", [client.rows[0].id, lead.id]);
      response.client = client.rows[0];
    }

    if (convertTo.includes("order")) {
      const today = new Date();
      const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
      const countResult = await pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE");
      const count = parseInt(countResult.rows[0].count) + 1;
      const job_id = `${datePart}-${String(count).padStart(3, "0")}`;

      const order = await pool.query(
        `INSERT INTO orders (job_id, client_id, job_type, quantity, specifications, delivery_expected, status)
        VALUES ($1,$2,$3,$4,$5,$6,'negotiation') RETURNING *`,
        [job_id, lead.client_id, lead.job_type, lead.quantity, lead.specifications, lead.delivery_expected]
      );
      await pool.query("UPDATE leads SET order_id=$1 WHERE id=$2", [order.rows[0].id, lead.id]);
      response.order = order.rows[0];
    }

    if (convertTo.includes("quotation")) {
      const countResult = await pool.query("SELECT COUNT(*) FROM quotations");
      const count = parseInt(countResult.rows[0].count) + 1;
      const quotation_id = `QT-${String(count).padStart(4, "0")}`;

      const quotation = await pool.query(
        `INSERT INTO quotations (quotation_id, client_id, date, tax_mode, show_tax_details, lead_id)
        VALUES ($1,$2,NOW(),'exclusive',true,$3) RETURNING *`,
        [quotation_id, lead.client_id, lead.id]
      );

      await pool.query(
        `INSERT INTO quotation_items (quotation_id, description, quantity, rate, amount, sort_order)
        VALUES ($1,$2,$3,0,0,0)`,
        [quotation.rows[0].id, lead.specifications, lead.quantity]
      );

      await pool.query(
        `INSERT INTO lead_quotations (lead_id, quotation_id) VALUES ($1,$2)`,
        [lead.id, quotation.rows[0].id]
      );

      response.quotation = quotation.rows[0];
    }

    const parts = convertTo.join(', ');
    await logActivity({ userId: req.user.id, action: "converted", entityType: "lead", entityId: lead.id, entityLabel: lead.lead_id, message: `Converted lead ${lead.lead_id} to: ${parts}` });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
