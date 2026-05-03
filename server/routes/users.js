const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const { uploadFile, getPresignedUrl } = require("../config/r2Utils");

const photoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Get all users (includes photo key for avatar resolution)
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, name, role, photo FROM users ORDER BY id"
    );
    // Attach presigned URLs for users that have a photo
    const rows = await Promise.all(result.rows.map(async (u) => {
      if (!u.photo) return u;
      try {
        const photoUrl = await getPresignedUrl(u.photo, 3600);
        return { ...u, photoUrl };
      } catch {
        return u;
      }
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get presigned photo URL for a single user
router.get("/:id/photo", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT photo FROM users WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const key = result.rows[0].photo;
    if (!key) return res.json({ photoUrl: null });
    const photoUrl = await getPresignedUrl(key, 3600);
    res.json({ photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload user photo
router.post("/:id/photo", authenticate, photoUpload.single("photo"), async (req, res) => {
  // Only allow users to update their own photo (or superadmin)
  if (Number(req.params.id) !== req.user.id && req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const ext = req.file.originalname.split('.').pop();
    const key = `avatars/${req.params.id}-${Date.now()}.${ext}`;
    await uploadFile(req.file.buffer, key, req.file.mimetype);
    await pool.query("UPDATE users SET photo = $1 WHERE id = $2", [key, req.params.id]);
    const photoUrl = await getPresignedUrl(key, 3600);
    res.json({ success: true, photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Create user (superadmin only)
router.post("/", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  const { username, name, role, password } = req.body;
  if (!username || !name || !role || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, name, role, password) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role",
      [username, name, role, hashed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Username already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user (superadmin only)
router.patch("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  const { name, username, role, password } = req.body;
  try {
    const sets = [];
    const vals = [];
    let idx = 1;
    if (name !== undefined) { sets.push(`name = $${idx++}`); vals.push(name); }
    if (username !== undefined) { sets.push(`username = $${idx++}`); vals.push(username); }
    if (role !== undefined) { sets.push(`role = $${idx++}`); vals.push(role); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      sets.push(`password = $${idx++}`);
      vals.push(hashed);
    }
    if (sets.length === 0) return res.status(400).json({ error: "Nothing to update" });
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id, username, name, role`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Username already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user (superadmin only)
router.delete("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;