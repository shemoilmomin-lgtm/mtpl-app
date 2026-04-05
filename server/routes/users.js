const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all users
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, name, role FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user photo
router.get("/:id/photo", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT photo FROM users WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ photo: result.rows[0].photo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save user photo
router.post("/:id/photo", authenticate, async (req, res) => {
  const { photo } = req.body;
  try {
    await pool.query(
      "UPDATE users SET photo = $1 WHERE id = $2",
      [photo, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;