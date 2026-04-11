const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get global activity log (superadmin only)
router.get("/", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const { entity_type, action, user_id, limit = 500 } = req.query;

    const conditions = [];
    const params = [];

    if (entity_type) {
      params.push(entity_type);
      conditions.push(`al.entity_type = $${params.length}`);
    }
    if (action) {
      params.push(action);
      conditions.push(`al.action = $${params.length}`);
    }
    if (user_id) {
      params.push(parseInt(user_id));
      conditions.push(`al.user_id = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    params.push(parseInt(limit));
    const result = await pool.query(
      `SELECT al.*, u.name as user_name, u.username as user_username
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${params.length}`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get activity logs for a specific entity (used in detail views)
router.get("/:entity_type/:entity_id", authenticate, async (req, res) => {
  const { entity_type, entity_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT al.*, u.name as user_name FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.entity_type=$1 AND al.entity_id=$2
      ORDER BY al.created_at DESC`,
      [entity_type, entity_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
