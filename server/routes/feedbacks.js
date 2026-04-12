const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const multer = require("multer");
const { uploadFile } = require("../config/r2Utils");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

// Ensure feedbacks table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(err => console.error("feedbacks table init error:", err));

// Submit feedback (all users)
router.post("/", authenticate, upload.array("attachments", 3), async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const attachments = [];
    for (const file of (req.files || [])) {
      const fileName = `feedback-${Date.now()}-${file.originalname}`;
      await uploadFile(file.buffer, fileName, file.mimetype);
      attachments.push({ fileName, displayName: file.originalname, mimeType: file.mimetype });
    }

    const result = await pool.query(
      `INSERT INTO feedbacks (user_id, message, attachments) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, message.trim(), JSON.stringify(attachments)]
    );
    res.json({ success: true, feedback: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// List feedbacks (admin/superadmin only)
router.get("/", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const result = await pool.query(`
      SELECT f.*, u.name AS user_name, u.role AS user_role
      FROM feedbacks f
      JOIN users u ON u.id = f.user_id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
