const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const logActivity = require("../helpers/logActivity");
const { buildDiff } = require("../helpers/logActivity");

// Get trashed clients (superadmin only)
router.get("/trashed", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const result = await pool.query("SELECT * FROM clients WHERE is_deleted = TRUE ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all clients
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clients WHERE is_deleted = FALSE ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create or update client
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    full_name,
    company_name,
    gst_number,
    contact_1_name, contact_1_no,
    contact_2_name, contact_2_no,
    contact_3_name, contact_3_no,
    contact_4_name, contact_4_no,
    accountant_name, accountant_no,
    email,
    address,
  } = req.body;

  try {
    if (id) {
      const existing = await pool.query("SELECT * FROM clients WHERE id=$1", [id]);
      const old = existing.rows[0];
      const client_id_label = old?.client_id;

      await pool.query(
        `UPDATE clients SET
          full_name=$1, company_name=$2, gst_number=$3,
          contact_1_name=$4, contact_1_no=$5,
          contact_2_name=$6, contact_2_no=$7,
          contact_3_name=$8, contact_3_no=$9,
          contact_4_name=$10, contact_4_no=$11,
          accountant_name=$12, accountant_no=$13,
          email=$14, address=$15
        WHERE id=$16`,
        [
          full_name, company_name, gst_number,
          contact_1_name, contact_1_no,
          contact_2_name, contact_2_no,
          contact_3_name, contact_3_no,
          contact_4_name, contact_4_no,
          accountant_name, accountant_no,
          email, address, id
        ]
      );
      const diff = buildDiff(old, req.body, [
        { key: 'full_name', label: 'Name' },
        { key: 'company_name', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' },
        { key: 'gst_number', label: 'GST No.' },
        { key: 'contact_1_name', label: 'Contact 1 Name' },
        { key: 'contact_1_no', label: 'Contact 1 No.' },
        { key: 'contact_2_name', label: 'Contact 2 Name' },
        { key: 'contact_2_no', label: 'Contact 2 No.' },
        { key: 'contact_3_name', label: 'Contact 3 Name' },
        { key: 'contact_3_no', label: 'Contact 3 No.' },
        { key: 'contact_4_name', label: 'Contact 4 Name' },
        { key: 'contact_4_no', label: 'Contact 4 No.' },
        { key: 'accountant_name', label: 'Accountant Name' },
        { key: 'accountant_no', label: 'Accountant No.' },
      ]);
      await logActivity({ userId: req.user.id, action: "edited", entityType: "client", entityId: id, entityLabel: client_id_label, message: diff || 'Saved with no changes' });
      res.json({ success: true });
    } else {
      // Generate client_id
      const countResult = await pool.query("SELECT COUNT(*) FROM clients");
      const count = parseInt(countResult.rows[0].count) + 1;
      const client_id = `CLT-${String(count).padStart(4, "0")}`;

      const result = await pool.query(
        `INSERT INTO clients (
          client_id, full_name, company_name, gst_number,
          contact_1_name, contact_1_no,
          contact_2_name, contact_2_no,
          contact_3_name, contact_3_no,
          contact_4_name, contact_4_no,
          accountant_name, accountant_no,
          email, address
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING *`,
        [
          client_id, full_name, company_name, gst_number,
          contact_1_name, contact_1_no,
          contact_2_name, contact_2_no,
          contact_3_name, contact_3_no,
          contact_4_name, contact_4_no,
          accountant_name, accountant_no,
          email, address
        ]
      );
      const newClient = result.rows[0];
      await logActivity({ userId: req.user.id, action: "created", entityType: "client", entityId: newClient.id, entityLabel: client_id });
      res.json(newClient);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Unarchive a client (restore)
router.post("/unarchive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT client_id FROM clients WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE clients SET is_archived = false WHERE id = $1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "client", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.client_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Archive a client (admin + superadmin)
router.post("/archive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT client_id FROM clients WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE clients SET is_archived = true WHERE id = $1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "archived", entityType: "client", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.client_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Trash a client (superadmin only)
router.post("/trash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT client_id FROM clients WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE clients SET is_deleted=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "trashed", entityType: "client", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.client_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Untrash a client (superadmin only)
router.post("/untrash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT client_id FROM clients WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE clients SET is_deleted=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "client", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.client_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Permanently delete a client (superadmin only)
router.post("/permanent-delete/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT client_id FROM clients WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "deleted", entityType: "client", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.client_id });
    await pool.query("DELETE FROM clients WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;