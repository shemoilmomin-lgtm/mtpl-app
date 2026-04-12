const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const { pushToUser } = require("../config/sseClients");
const logActivity = require("../helpers/logActivity");

// Get reminder send history for a task
router.get("/:task_id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT trs.*,
        sb.name AS sent_by_name,
        st.name AS sent_to_name
      FROM task_reminder_sends trs
      JOIN users sb ON sb.id = trs.sent_by
      JOIN users st ON st.id = trs.sent_to
      WHERE trs.task_id = $1
      ORDER BY trs.sent_at DESC`,
      [req.params.task_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Send reminder to a task assignee (admin+ only)
router.post("/send", authenticate, async (req, res) => {
  const { role, id: senderId } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { task_id, sent_to } = req.body;
  if (!task_id || !sent_to) {
    return res.status(400).json({ error: "task_id and sent_to are required" });
  }

  try {
    const taskResult = await pool.query("SELECT * FROM tasks WHERE id=$1", [task_id]);
    if (!taskResult.rows.length) return res.status(404).json({ error: "Task not found" });
    const task = taskResult.rows[0];

    const senderResult = await pool.query("SELECT name FROM users WHERE id=$1", [senderId]);
    const senderName = senderResult.rows[0]?.name || "Admin";

    const result = await pool.query(
      `INSERT INTO task_reminder_sends (task_id, sent_by, sent_to)
      VALUES ($1,$2,$3) RETURNING *`,
      [task_id, senderId, sent_to]
    );
    const send = result.rows[0];

    const message = `${senderName} sent you a reminder for task: ${task.title}`;

    // Persist to notifications table
    const notifResult = await pool.query(
      `INSERT INTO notifications (user_id, message, entity_type, entity_id, notification_type, sender_id)
       VALUES ($1, $2, 'task', $3, 'reminder', $4) RETURNING *`,
      [sent_to, message, task_id, senderId]
    );
    const notif = notifResult.rows[0];

    // Push live notification to the recipient
    pushToUser(sent_to, "notification", {
      id: notif.id,
      type: "reminder",
      task_id,
      task_title: task.title,
      sent_by_name: senderName,
      sent_at: send.sent_at,
      message,
    });

    const recipientResult = await pool.query("SELECT name FROM users WHERE id=$1", [sent_to]);
    const recipientName = recipientResult.rows[0]?.name || "a user";

    await logActivity({
      userId: senderId,
      action: "sent reminder",
      entityType: "task",
      entityId: task_id,
      message: `Sent a reminder to ${recipientName} for task: ${task.title}`,
    });

    res.json(send);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
