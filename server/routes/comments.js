const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const logActivity = require("../helpers/logActivity");

// Feed: comments mentioning the user OR on orders/tasks they're currently assigned to
router.get("/feed", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    if (!userResult.rows.length) return res.json([]);
    const userName = userResult.rows[0].name;

    const result = await pool.query(
      `SELECT
        c.id, c.entity_type, c.entity_id, c.message, c.created_at, c.parent_id,
        u.name AS author_name,
        CASE WHEN c.message ILIKE '%@' || $2 || '%' THEN 'mention' ELSE 'assignment' END AS feed_reason,
        CASE
          WHEN c.entity_type = 'order'     THEN o.job_id
          WHEN c.entity_type = 'task'      THEN t.title
          WHEN c.entity_type = 'quotation' THEN q.quotation_id
          WHEN c.entity_type = 'client'    THEN cl.full_name
          WHEN c.entity_type = 'lead'      THEN ld.lead_id
        END AS entity_label
      FROM comments c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN orders o     ON o.id  = c.entity_id AND c.entity_type = 'order'
      LEFT JOIN tasks t      ON t.id  = c.entity_id AND c.entity_type = 'task'
      LEFT JOIN quotations q ON q.id  = c.entity_id AND c.entity_type = 'quotation'
      LEFT JOIN clients cl   ON cl.id = c.entity_id AND c.entity_type = 'client'
      LEFT JOIN leads ld     ON ld.id = c.entity_id AND c.entity_type = 'lead'
      WHERE c.user_id != $1
        AND (
          c.message ILIKE '%@' || $2 || '%'
          OR (c.entity_type = 'order' AND EXISTS (
            SELECT 1 FROM order_assignees oa WHERE oa.order_id = c.entity_id AND oa.user_id = $1
          ))
          OR (c.entity_type = 'task' AND EXISTS (
            SELECT 1 FROM task_assignees ta WHERE ta.task_id = c.entity_id AND ta.user_id = $1
          ))
        )
      ORDER BY c.created_at DESC
      LIMIT 50`,
      [userId, userName]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

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
    await logActivity({ userId: user_id, action: "commented", entityType: entity_type, entityId: entity_id });
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
