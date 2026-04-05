const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all settings
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings");
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save a setting (upsert by key)
router.post("/save", authenticate, async (req, res) => {
  const { key, value } = req.body;
  try {
    await pool.query(
      `INSERT INTO settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
      [key, value]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Export all data
router.get("/export", authenticate, async (req, res) => {
  try {
    const [clients, orders, quotations, tasks, leads] = await Promise.all([
      pool.query("SELECT * FROM clients"),
      pool.query("SELECT * FROM orders"),
      pool.query("SELECT * FROM quotations"),
      pool.query("SELECT * FROM tasks"),
      pool.query("SELECT * FROM leads"),
    ]);
    res.json({
      clients: clients.rows,
      orders: orders.rows,
      quotations: quotations.rows,
      tasks: tasks.rows,
      leads: leads.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
