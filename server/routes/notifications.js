const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all notifications for a user (last 30 days)
router.get("/:user_id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.name AS sender_name
      FROM notifications n
      LEFT JOIN users u ON u.id = n.sender_id
      WHERE n.user_id=$1 AND n.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY n.created_at DESC`,
      [req.params.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save notification
router.post("/save", authenticate, async (req, res) => {
  const { user_id, message, entity_type, entity_id, notification_type, sender_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message, entity_type, entity_id, notification_type, sender_id)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id, message, entity_type || null, entity_id || null, notification_type || null, sender_id || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark all notifications as read for a user
router.post("/mark-read/:user_id", authenticate, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read=true WHERE user_id=$1",
      [req.params.user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Clear all notifications for a user
router.post("/clear/:user_id", authenticate, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM notifications WHERE user_id=$1",
      [req.params.user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
