const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all pending reminders for a user
router.get("/:user_id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reminders
      WHERE user_id=$1 AND is_dismissed=false
      ORDER BY remind_at ASC`,
      [req.params.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create reminder
router.post("/save", authenticate, async (req, res) => {
  const { task_id, user_id, remind_at } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO reminders (task_id, user_id, remind_at)
      VALUES ($1,$2,$3) RETURNING *`,
      [task_id, user_id, remind_at]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Dismiss reminder
router.post("/dismiss/:id", authenticate, async (req, res) => {
  try {
    await pool.query(
      "UPDATE reminders SET is_dismissed=true WHERE id=$1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
