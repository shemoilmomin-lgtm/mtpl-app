const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get comments for an entity
router.get("/:entity_type/:entity_id", authenticate, async (req, res) => {
  const { entity_type, entity_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM comments
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

// Add comment
router.post("/save", authenticate, async (req, res) => {
  const { entity_type, entity_id, user_id, message, parent_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO comments (entity_type, entity_id, user_id, message, parent_id)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [entity_type, entity_id, user_id, message, parent_id || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete comment
router.post("/delete/:id", authenticate, async (req, res) => {
  try {
    await pool.query("DELETE FROM comments WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
