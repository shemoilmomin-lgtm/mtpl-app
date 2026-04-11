const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const logActivity = require("../helpers/logActivity");
const { buildDiff } = require("../helpers/logActivity");

// Get trashed quotations (superadmin only)
router.get("/trashed", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const quotations = await pool.query("SELECT * FROM quotations WHERE is_deleted = TRUE ORDER BY created_at DESC");
    const items = await pool.query("SELECT * FROM quotation_items ORDER BY quotation_id, sort_order ASC");
    const result = quotations.rows.map(q => ({
      ...q,
      items: items.rows.filter(i => i.quotation_id === q.id)
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all quotations with their line items
router.get("/", authenticate, async (req, res) => {
  try {
    const quotations = await pool.query(
      "SELECT * FROM quotations WHERE is_deleted = FALSE ORDER BY created_at DESC"
    );
    const items = await pool.query(
      "SELECT * FROM quotation_items ORDER BY quotation_id, sort_order ASC"
    );

    const result = quotations.rows.map(q => ({
      ...q,
      items: items.rows.filter(i => i.quotation_id === q.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create or update quotation
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    client_id,
    manual_client_name,
    manual_client_address,
    manual_client_phone,
    manual_client_email,
    lead_id,
    order_id,
    date,
    subject,
    tax_mode,
    show_tax_details,
    hide_totals,
    terms_and_conditions,
    signature_block,
    discount_type,
    discount_amount,
    notes,
    created_by,
    items,
  } = req.body;

  try {
    if (id) {
      const existing = await pool.query("SELECT * FROM quotations WHERE id=$1", [id]);
      const old = existing.rows[0];
      const quotation_label = old?.quotation_id;

      // Fetch old items before delete
      const oldItemsResult = await pool.query("SELECT item_name, description FROM quotation_items WHERE quotation_id=$1 ORDER BY sort_order ASC", [id]);
      const oldItems = oldItemsResult.rows;

      await pool.query(
        `UPDATE quotations SET
          client_id=$1, date=$2, subject=$3, tax_mode=$4,
          show_tax_details=$5, terms_and_conditions=$6, signature_block=$7,
          discount_type=$8, discount_amount=$9, notes=$10,
          manual_client_name=$11, manual_client_address=$12,
          manual_client_phone=$13, manual_client_email=$14,
          lead_id=$15, order_id=$16, hide_totals=$17
        WHERE id=$18`,
        [client_id, date, subject, tax_mode, show_tax_details, terms_and_conditions, signature_block ?? null,
         discount_type, discount_amount, notes,
         manual_client_name, manual_client_address, manual_client_phone, manual_client_email,
         lead_id || null, order_id || null, hide_totals ?? false,
         id]
      );

      await pool.query("DELETE FROM quotation_items WHERE quotation_id=$1", [id]);
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const { item_name, description, quantity, rate, amount } = items[i];
          await pool.query(
            `INSERT INTO quotation_items (quotation_id, item_name, description, quantity, rate, amount, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [id, item_name, description, quantity, rate, amount, i]
          );
        }
      }

      const diff = buildDiff(old, req.body, [
        { key: 'subject', label: 'Subject' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'tax_mode', label: 'Tax Mode' },
        { key: 'show_tax_details', label: 'Show Tax Details' },
        { key: 'discount_type', label: 'Discount Type' },
        { key: 'discount_amount', label: 'Discount', type: 'number' },
        { key: 'notes', label: 'Notes' },
        { key: 'terms_and_conditions', label: 'Terms & Conditions' },
        { key: 'manual_client_name', label: 'Client Name (manual)' },
        { key: 'manual_client_address', label: 'Client Address (manual)' },
        { key: 'manual_client_phone', label: 'Client Phone (manual)' },
        { key: 'manual_client_email', label: 'Client Email (manual)' },
      ]);

      const extraChanges = [];

      // Client (select mode)
      if (String(old.client_id || '') !== String(client_id || '')) {
        const [oldC, newC] = await Promise.all([
          old.client_id ? pool.query("SELECT full_name FROM clients WHERE id=$1", [old.client_id]) : null,
          client_id ? pool.query("SELECT full_name FROM clients WHERE id=$1", [client_id]) : null,
        ]);
        extraChanges.push(`Client: ${oldC?.rows[0]?.full_name || '(none)'} → ${newC?.rows[0]?.full_name || '(none)'}`);
      }

      // Linked Lead
      if (String(old.lead_id || '') !== String(lead_id || '')) {
        const [oldL, newL] = await Promise.all([
          old.lead_id ? pool.query("SELECT lead_id FROM leads WHERE id=$1", [old.lead_id]) : null,
          lead_id ? pool.query("SELECT lead_id FROM leads WHERE id=$1", [lead_id]) : null,
        ]);
        extraChanges.push(`Linked Lead: ${oldL?.rows[0]?.lead_id || '(none)'} → ${newL?.rows[0]?.lead_id || '(none)'}`);
      }

      // Linked Order
      if (String(old.order_id || '') !== String(order_id || '')) {
        const [oldO, newO] = await Promise.all([
          old.order_id ? pool.query("SELECT job_id FROM orders WHERE id=$1", [old.order_id]) : null,
          order_id ? pool.query("SELECT job_id FROM orders WHERE id=$1", [order_id]) : null,
        ]);
        extraChanges.push(`Linked Order: ${oldO?.rows[0]?.job_id || '(none)'} → ${newO?.rows[0]?.job_id || '(none)'}`);
      }

      // Line items
      const newItems = items || [];
      const oldItemCount = oldItems.length;
      const newItemCount = newItems.length;
      if (oldItemCount !== newItemCount) {
        extraChanges.push(`Line items: ${oldItemCount} item${oldItemCount !== 1 ? 's' : ''} → ${newItemCount} item${newItemCount !== 1 ? 's' : ''}`);
      }
      const maxLen = Math.min(oldItemCount, newItemCount);
      for (let i = 0; i < maxLen; i++) {
        const oldName = (oldItems[i].item_name || '').trim();
        const newName = (newItems[i].item_name || '').trim();
        if (oldName !== newName) {
          extraChanges.push(`Item ${i + 1} Name: ${oldName || '(empty)'} → ${newName || '(empty)'}`);
        }
        const oldDesc = (oldItems[i].description || '').trim();
        const newDesc = (newItems[i].description || '').trim();
        if (oldDesc !== newDesc) {
          extraChanges.push(`Item ${i + 1} Description: ${oldDesc || '(empty)'} → ${newDesc || '(empty)'}`);
        }
      }

      const allChanges = [diff, ...extraChanges].filter(Boolean).join('; ');
      await logActivity({ userId: req.user.id, action: "edited", entityType: "quotation", entityId: id, entityLabel: quotation_label, message: allChanges || 'Saved with no changes' });
      res.json({ success: true });
    } else {
      const countResult = await pool.query("SELECT COUNT(*) FROM quotations");
      const count = parseInt(countResult.rows[0].count) + 1;
      const quotation_id = `QT-${String(count).padStart(4, "0")}`;

      const result = await pool.query(
        `INSERT INTO quotations (quotation_id, client_id, date, subject, tax_mode, show_tax_details, hide_totals, terms_and_conditions, signature_block, discount_type, discount_amount, notes, created_by, manual_client_name, manual_client_address, manual_client_phone, manual_client_email, lead_id, order_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        RETURNING *`,
        [quotation_id, client_id, date, subject, tax_mode, show_tax_details, hide_totals ?? false, terms_and_conditions, signature_block, discount_type, discount_amount, notes, created_by,
         manual_client_name, manual_client_address, manual_client_phone, manual_client_email,
         lead_id || null, order_id || null]
      );

      const newQuotation = result.rows[0];

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const { item_name, description, quantity, rate, amount } = items[i];
          await pool.query(
            `INSERT INTO quotation_items (quotation_id, item_name, description, quantity, rate, amount, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [newQuotation.id, item_name, description, quantity, rate, amount, i]
          );
        }
      }

      await logActivity({ userId: req.user.id, action: "created", entityType: "quotation", entityId: newQuotation.id, entityLabel: quotation_id });
      res.json(newQuotation);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Duplicate quotation
router.post("/duplicate/:id", authenticate, async (req, res) => {
  try {
    const original = await pool.query("SELECT * FROM quotations WHERE id=$1", [req.params.id]);
    if (original.rows.length === 0) return res.status(404).json({ error: "Quotation not found" });

    const q = original.rows[0];

    const countResult = await pool.query("SELECT COUNT(*) FROM quotations");
    const count = parseInt(countResult.rows[0].count) + 1;
    const quotation_id = `QT-${String(count).padStart(4, "0")}`;

    const result = await pool.query(
      `INSERT INTO quotations (quotation_id, client_id, date, subject, tax_mode, show_tax_details, terms_and_conditions, signature_block, discount_type, discount_amount, notes, created_by, manual_client_name, manual_client_address, manual_client_phone, manual_client_email)
      VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [quotation_id, q.client_id, q.subject, q.tax_mode, q.show_tax_details, q.terms_and_conditions, q.signature_block, q.discount_type, q.discount_amount, q.notes, q.created_by,
       q.manual_client_name, q.manual_client_address, q.manual_client_phone, q.manual_client_email]
    );

    const newQuotation = result.rows[0];

    const originalItems = await pool.query(
      "SELECT * FROM quotation_items WHERE quotation_id=$1 ORDER BY sort_order ASC",
      [q.id]
    );

    for (let i = 0; i < originalItems.rows.length; i++) {
      const item = originalItems.rows[i];
      await pool.query(
        `INSERT INTO quotation_items (quotation_id, description, quantity, rate, amount, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [newQuotation.id, item.description, item.quantity, item.rate, item.amount, i]
      );
    }

    await logActivity({ userId: req.user.id, action: "duplicated", entityType: "quotation", entityId: newQuotation.id, entityLabel: quotation_id, message: `Duplicated quotation ${q.quotation_id} → ${quotation_id}` });
    res.json(newQuotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Archive quotation
router.post("/archive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT quotation_id FROM quotations WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE quotations SET is_archived=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "archived", entityType: "quotation", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.quotation_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Unarchive quotation (restore)
router.post("/unarchive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT quotation_id FROM quotations WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE quotations SET is_archived=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "quotation", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.quotation_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Trash quotation (superadmin only)
router.post("/trash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT quotation_id FROM quotations WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE quotations SET is_deleted=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "trashed", entityType: "quotation", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.quotation_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Untrash quotation (superadmin only)
router.post("/untrash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT quotation_id FROM quotations WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE quotations SET is_deleted=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "quotation", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.quotation_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Permanently delete quotation (superadmin only)
router.post("/permanent-delete/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT quotation_id FROM quotations WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "deleted", entityType: "quotation", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.quotation_id });
    await pool.query("DELETE FROM quotations WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
