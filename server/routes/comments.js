const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const logActivity = require("../helpers/logActivity");
const jwt = require("jsonwebtoken");
const { addClient, removeClient, pushToUser, pushToAll } = require("../config/sseClients");

// SSE stream — client connects here to receive live comment pushes
router.get("/stream", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).end();
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(403).end();
  }
  const userId = decoded.id;

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  res.write(": connected\n\n");

  addClient(userId, res);

  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n") } catch {}
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  });
});

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
          OR (c.entity_type = 'order' AND o.prepared_by = $1)
          OR (c.entity_type = 'task' AND EXISTS (
            SELECT 1 FROM task_assignees ta WHERE ta.task_id = c.entity_id AND ta.user_id = $1
          ))
          OR (c.entity_type = 'task'      AND t.created_by = $1)
          OR (c.entity_type = 'quotation' AND q.created_by = $1)
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
    const comment = result.rows[0];
    await logActivity({ userId: user_id, action: "commented", entityType: entity_type, entityId: entity_id });

    // Push live update to affected users
    pushCommentToAffectedUsers(comment, entity_type, entity_id, user_id, message).catch(() => {});

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

async function pushCommentToAffectedUsers(comment, entity_type, entity_id, user_id, message) {
  // Gather target user IDs: assignees + creators + mentioned users, excluding the commenter
  const targetIds = new Set();

  // 1. Assignees of the entity
  if (entity_type === "order") {
    const r = await pool.query(
      "SELECT user_id FROM order_assignees WHERE order_id = $1", [entity_id]
    );
    r.rows.forEach(row => targetIds.add(row.user_id));
  } else if (entity_type === "task") {
    const r = await pool.query(
      "SELECT user_id FROM task_assignees WHERE task_id = $1", [entity_id]
    );
    r.rows.forEach(row => targetIds.add(row.user_id));
  }

  // 2. Creator of the entity
  if (entity_type === "order") {
    const r = await pool.query("SELECT prepared_by FROM orders WHERE id = $1", [entity_id]);
    if (r.rows[0]?.prepared_by) targetIds.add(r.rows[0].prepared_by);
  } else if (entity_type === "task") {
    const r = await pool.query("SELECT created_by FROM tasks WHERE id = $1", [entity_id]);
    if (r.rows[0]?.created_by) targetIds.add(r.rows[0].created_by);
  } else if (entity_type === "quotation") {
    const r = await pool.query("SELECT created_by FROM quotations WHERE id = $1", [entity_id]);
    if (r.rows[0]?.created_by) targetIds.add(r.rows[0].created_by);
  }

  // 3. Mentioned users by @name
  const mentionMatches = message.match(/@([^@\s,]+(?:\s[^@\s,]+)*)/g) || [];
  const mentionedUserIds = new Set();
  if (mentionMatches.length) {
    const names = mentionMatches.map(m => m.slice(1).trim());
    const r = await pool.query("SELECT id FROM users WHERE name = ANY($1)", [names]);
    r.rows.forEach(row => {
      targetIds.add(row.id);
      mentionedUserIds.add(row.id);
    });
  }

  targetIds.delete(user_id); // don't push to the commenter

  // Build the enriched payload matching the feed query shape
  const authorRow = await pool.query("SELECT name FROM users WHERE id = $1", [user_id]);
  const author_name = authorRow.rows[0]?.name || "";

  let entity_label = null;
  if (entity_type === "order") {
    const r = await pool.query("SELECT job_id FROM orders WHERE id = $1", [entity_id]);
    entity_label = r.rows[0]?.job_id || null;
  } else if (entity_type === "task") {
    const r = await pool.query("SELECT title FROM tasks WHERE id = $1", [entity_id]);
    entity_label = r.rows[0]?.title || null;
  } else if (entity_type === "quotation") {
    const r = await pool.query("SELECT quotation_id FROM quotations WHERE id = $1", [entity_id]);
    entity_label = r.rows[0]?.quotation_id || null;
  } else if (entity_type === "client") {
    const r = await pool.query("SELECT full_name FROM clients WHERE id = $1", [entity_id]);
    entity_label = r.rows[0]?.full_name || null;
  } else if (entity_type === "lead") {
    const r = await pool.query("SELECT lead_id FROM leads WHERE id = $1", [entity_id]);
    entity_label = r.rows[0]?.lead_id || null;
  }

  // Push targeted feed event to assignees/creators/mentioned users
  for (const uid of targetIds) {
    pushToUser(uid, "comment", {
      ...comment,
      author_name,
      entity_label,
      feed_reason: mentionedUserIds.has(uid) ? "mention" : "assignment",
    });
  }

  // Broadcast entity_comment to ALL connected users so any open record view can live-update
  pushToAll("entity_comment", {
    ...comment,
    author_name,
  });
}

// Delete comment
router.post("/delete/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comments WHERE id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Comment not found" });

    const comment = result.rows[0];
    const role = req.user.role;
    const isAdmin = role === "admin" || role === "superadmin";
    const isAuthor = comment.user_id === req.user.id;
    const withinWindow = (Date.now() - new Date(comment.created_at).getTime()) < 30 * 60 * 1000;

    if (!isAdmin && !(isAuthor && withinWindow)) {
      return res.status(403).json({ error: "Not allowed to delete this comment" });
    }

    await pool.query("DELETE FROM comments WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
