const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get activity logs for an entity
router.get("/:entity_type/:entity_id", authenticate, async (req, res) => {
  const { entity_type, entity_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM activity_logs
      WHERE entity_type=$1 AND entity_id=$2
      ORDER BY created_at DESC`,
      [entity_type, entity_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get global app activity log
router.get("/app/all", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save activity log entry
router.post("/save", authenticate, async (req, res) => {
  const { entity_type, entity_id, user_id, message } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO activity_logs (entity_type, entity_id, user_id, message)
      VALUES ($1,$2,$3,$4) RETURNING *`,
      [entity_type, entity_id, user_id, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete activity log entry
router.post("/delete/:id", authenticate, async (req, res) => {
  try {
    await pool.query("DELETE FROM activity_logs WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
