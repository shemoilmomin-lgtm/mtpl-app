const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const logActivity = require("../helpers/logActivity");
const { buildDiff } = require("../helpers/logActivity");

// Generate next job_id: YYYYMMDD-xxx where xxx is global max sequence + 1
async function nextJobId() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const result = await pool.query(
    `SELECT MAX(CAST(SPLIT_PART(job_id, '-', 2) AS INTEGER)) AS max_seq
     FROM orders
     WHERE job_id LIKE '%-%'`
  );
  const maxSeq = parseInt(result.rows[0].max_seq) || 0;
  return `${datePart}-${String(maxSeq + 1).padStart(3, "0")}`;
}

// Preview next job_id (for the create form)
router.get("/next-id", authenticate, async (req, res) => {
  try {
    res.json({ job_id: await nextJobId() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get trashed orders (superadmin only)
router.get("/trashed", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const orders = await pool.query("SELECT * FROM orders WHERE is_deleted = TRUE ORDER BY created_at DESC");
    const assignees = await pool.query(
      `SELECT oa.order_id, u.id, u.name FROM order_assignees oa
      JOIN users u ON u.id = oa.user_id`
    );
    const result = orders.rows.map(o => ({
      ...o,
      assignees: assignees.rows.filter(a => a.order_id === o.id)
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Inline-edit invoice numbers from view mode (admin+)
router.patch("/:id/invoice", authenticate, async (req, res) => {
  const { role, id: userId } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { field, value } = req.body;
  if (!["proforma_invoice_number", "invoice_number", "delivery_expected"].includes(field)) {
    return res.status(400).json({ error: "Invalid field" });
  }
  try {
    const result = await pool.query(
      `UPDATE orders SET ${field} = $1 WHERE id = $2 RETURNING *`,
      [value || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    await logActivity({
      userId,
      action: "edited",
      entityType: "order",
      entityId: Number(req.params.id),
      message: `Updated ${field === "invoice_number" ? "Tax Invoice No." : field === "delivery_expected" ? "Delivery Date" : "Proforma No."} to: ${value || "(cleared)"}`,
    });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all orders with assignees
router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await pool.query("SELECT * FROM orders WHERE is_deleted = FALSE ORDER BY created_at DESC");
    const assignees = await pool.query(
      `SELECT oa.order_id, u.id, u.name FROM order_assignees oa
      JOIN users u ON u.id = oa.user_id`
    );

    const result = orders.rows.map(o => ({
      ...o,
      assignees: assignees.rows.filter(a => a.order_id === o.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create or update order
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    client_id,
    project_name,
    job_type,
    quantity,
    specifications,
    delivery_expected,
    quotation_ref_id,
    quotation_manual_no,
    quotation_manual_amount,
    advance,
    prepared_by,
    status,
    notes,
    assignees,
  } = req.body;

  const quotationAmount = parseFloat(quotation_manual_amount) || 0;
  const advanceAmount = parseFloat(advance) || 0;
  const balance = quotationAmount - advanceAmount;

  try {
    if (id) {
      const existing = await pool.query("SELECT * FROM orders WHERE id=$1", [id]);
      const old = existing.rows[0];
      const job_id = old?.job_id;

      // Fetch old assignees before they get deleted
      const oldAssigneeRows = await pool.query("SELECT user_id FROM order_assignees WHERE order_id=$1", [id]);
      const oldAssigneeIds = oldAssigneeRows.rows.map(r => r.user_id);

      await pool.query(
        `UPDATE orders SET
          client_id=$1, project_name=$2, job_type=$3, quantity=$4,
          specifications=$5, delivery_expected=$6,
          quotation_ref_id=$7, quotation_manual_no=$8, quotation_manual_amount=$9,
          advance=$10, balance=$11, prepared_by=$12, status=$13, notes=$14
        WHERE id=$15`,
        [
          client_id, project_name, job_type, quantity,
          specifications, delivery_expected,
          quotation_ref_id, quotation_manual_no, quotationAmount,
          advanceAmount, balance, prepared_by, status, notes, id
        ]
      );

      await pool.query("DELETE FROM order_assignees WHERE order_id=$1", [id]);
      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO order_assignees (order_id, user_id) VALUES ($1,$2)",
            [id, user_id]
          );
        }
      }

      // Simple field diff
      const diff = buildDiff(old, req.body, [
        { key: 'project_name', label: 'Project' },
        { key: 'status', label: 'Status' },
        { key: 'job_type', label: 'Job Type' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'specifications', label: 'Specifications' },
        { key: 'delivery_expected', label: 'Delivery', type: 'date' },
        { key: 'quotation_manual_no', label: 'Quotation No.' },
        { key: 'quotation_manual_amount', label: 'Quotation Amount', type: 'number' },
        { key: 'advance', label: 'Advance', type: 'number' },
        { key: 'notes', label: 'Notes' },
      ]);

      const extraChanges = [];

      // Client
      if (String(old.client_id || '') !== String(client_id || '')) {
        const [oldC, newC] = await Promise.all([
          old.client_id ? pool.query("SELECT full_name FROM clients WHERE id=$1", [old.client_id]) : null,
          client_id ? pool.query("SELECT full_name FROM clients WHERE id=$1", [client_id]) : null,
        ]);
        extraChanges.push(`Client: ${oldC?.rows[0]?.full_name || '(none)'} → ${newC?.rows[0]?.full_name || '(none)'}`);
      }

      // Prepared By
      if (String(old.prepared_by || '') !== String(prepared_by || '')) {
        const [oldU, newU] = await Promise.all([
          old.prepared_by ? pool.query("SELECT name FROM users WHERE id=$1", [old.prepared_by]) : null,
          prepared_by ? pool.query("SELECT name FROM users WHERE id=$1", [prepared_by]) : null,
        ]);
        extraChanges.push(`Prepared By: ${oldU?.rows[0]?.name || '(none)'} → ${newU?.rows[0]?.name || '(none)'}`);
      }

      // Assignees
      const newAssigneeIds = assignees || [];
      const oldSet = new Set(oldAssigneeIds.map(String));
      const newSet = new Set(newAssigneeIds.map(String));
      const assigneesChanged = oldSet.size !== newSet.size || [...oldSet].some(x => !newSet.has(x));
      if (assigneesChanged) {
        const allIds = [...new Set([...oldAssigneeIds, ...newAssigneeIds])];
        const userRows = allIds.length > 0
          ? (await pool.query("SELECT id, name FROM users WHERE id = ANY($1)", [allIds])).rows
          : [];
        const nameMap = Object.fromEntries(userRows.map(u => [String(u.id), u.name]));
        const oldNames = oldAssigneeIds.map(x => nameMap[String(x)] || x).join(', ') || '(none)';
        const newNames = newAssigneeIds.map(x => nameMap[String(x)] || x).join(', ') || '(none)';
        extraChanges.push(`Assignees: ${oldNames} → ${newNames}`);
      }

      const allChanges = [diff, ...extraChanges].filter(Boolean).join('; ');
      await logActivity({ userId: req.user.id, action: "edited", entityType: "order", entityId: id, entityLabel: job_id, message: allChanges || 'Saved with no changes' });
      res.json({ success: true });
    } else {
      const job_id = await nextJobId();

      const result = await pool.query(
        `INSERT INTO orders (
          job_id, client_id, project_name, job_type, quantity,
          specifications, delivery_expected,
          quotation_ref_id, quotation_manual_no, quotation_manual_amount,
          advance, balance, prepared_by, status, notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *`,
        [
          job_id, client_id, project_name, job_type, quantity,
          specifications, delivery_expected,
          quotation_ref_id, quotation_manual_no, quotationAmount,
          advanceAmount, balance, prepared_by, status, notes
        ]
      );

      const newOrder = result.rows[0];

      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO order_assignees (order_id, user_id) VALUES ($1,$2)",
            [newOrder.id, user_id]
          );
        }
      }

      await logActivity({ userId: req.user.id, action: "created", entityType: "order", entityId: newOrder.id, entityLabel: job_id });
      res.json(newOrder);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Duplicate order
router.post("/duplicate/:id", authenticate, async (req, res) => {
  try {
    const original = await pool.query("SELECT * FROM orders WHERE id=$1", [req.params.id]);
    if (original.rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const o = original.rows[0];

    const job_id = await nextJobId();

    const result = await pool.query(
      `INSERT INTO orders (
        job_id, client_id, project_name, job_type, quantity,
        specifications, delivery_expected,
        quotation_ref_id, quotation_manual_no, quotation_manual_amount,
        advance, balance, prepared_by, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        job_id, o.client_id, o.project_name, o.job_type, o.quantity,
        o.specifications, o.delivery_expected,
        o.quotation_ref_id, o.quotation_manual_no, o.quotation_manual_amount,
        o.advance, o.balance, o.prepared_by, o.status, o.notes
      ]
    );

    const newOrder = result.rows[0];
    await logActivity({ userId: req.user.id, action: "duplicated", entityType: "order", entityId: newOrder.id, entityLabel: job_id, message: `Duplicated order ${o.job_id} → ${job_id}` });
    res.json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Archive order
router.post("/archive/:id", authenticate, async (req, res) => {
  try {
    const r = await pool.query("SELECT job_id FROM orders WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE orders SET is_archived=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "archived", entityType: "order", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.job_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Unarchive order (restore)
router.post("/unarchive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT job_id FROM orders WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE orders SET is_archived=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "order", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.job_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Trash order (superadmin only)
router.post("/trash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT job_id FROM orders WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE orders SET is_deleted=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "trashed", entityType: "order", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.job_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Untrash order (superadmin only)
router.post("/untrash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT job_id FROM orders WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE orders SET is_deleted=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "order", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.job_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Permanently delete order (superadmin only)
router.post("/permanent-delete/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT job_id FROM orders WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "deleted", entityType: "order", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.job_id });
    await pool.query("DELETE FROM orders WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
