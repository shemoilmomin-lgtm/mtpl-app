const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");
const logActivity = require("../helpers/logActivity");
const { buildDiff } = require("../helpers/logActivity");
const { pushToUser } = require("../config/sseClients");

async function pushTaskNotification(userIds, notifData, excludeUserId) {
  const targets = userIds.filter(id => id !== excludeUserId);
  if (!targets.length) return;
  for (const uid of targets) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, message, entity_type, entity_id, notification_type, sender_id)
        VALUES ($1,$2,'task',$3,$4,$5)`,
        [uid, notifData.message, notifData.task_id, notifData.type, notifData.sender_id]
      );
      pushToUser(uid, "notification", { ...notifData, user_id: uid });
    } catch {}
  }
}

// Get trashed tasks (superadmin only)
router.get("/trashed", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const tasks = await pool.query("SELECT * FROM tasks WHERE is_deleted = TRUE ORDER BY created_at DESC");
    const assignees = await pool.query(
      `SELECT ta.task_id, u.id, u.name FROM task_assignees ta
      JOIN users u ON u.id = ta.user_id`
    );
    const result = tasks.rows.map(t => ({
      ...t,
      assignees: assignees.rows.filter(a => a.task_id === t.id)
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks with assignees
router.get("/", authenticate, async (req, res) => {
  try {
    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE is_deleted = FALSE AND is_archived = FALSE ORDER BY sort_order ASC, created_at DESC"
    );
    const assignees = await pool.query(
      `SELECT ta.task_id, u.id, u.name FROM task_assignees ta
      JOIN users u ON u.id = ta.user_id`
    );

    const result = tasks.rows.map(t => ({
      ...t,
      assignees: assignees.rows.filter(a => a.task_id === t.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create or update task
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    title,
    description,
    created_by,
    client_id,
    order_id,
    assignees,
    due_date,
  } = req.body;

  const VALID_STATUSES = ['in_queue', 'working', 'waiting', 'done'];
  const status = VALID_STATUSES.includes(req.body.status) ? req.body.status : 'in_queue';

  try {
    if (id) {
      const existing = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
      const old = existing.rows[0];

      await pool.query(
        `UPDATE tasks SET
          title=$1, description=$2,
          client_id=$3, order_id=$4, status=$5,
          due_date=$6
        WHERE id=$7`,
        [title, description, client_id, order_id, status, due_date || null, id]
      );

      await pool.query("DELETE FROM task_assignees WHERE task_id=$1", [id]);
      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO task_assignees (task_id, user_id) VALUES ($1,$2)",
            [id, user_id]
          );
        }
      }

      const diff = buildDiff(old, req.body, [
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'description', label: 'Description' },
        { key: 'due_date', label: 'Due Date' },
      ]);
      await logActivity({ userId: req.user.id, action: "edited", entityType: "task", entityId: id, entityLabel: title, message: diff || 'Saved with no changes' });

      // Notifications for changes
      const currentAssignees = await pool.query("SELECT user_id FROM task_assignees WHERE task_id=$1", [id]);
      const assigneeIds = currentAssignees.rows.map(r => r.user_id);
      const affectedIds = [...new Set([...assigneeIds, old.created_by].filter(Boolean))];

      if (old.title !== title) {
        await pushTaskNotification(affectedIds, {
          type: "title_changed",
          task_id: id,
          task_title: title,
          sender_id: req.user.id,
          message: `Task renamed from "${old.title}" to "${title}"`,
        }, req.user.id);
      }

      if (old.status !== status) {
        const statusLabels = { in_queue: 'In Queue', working: 'Working', waiting: 'Waiting', done: 'Done' };
        await pushTaskNotification(affectedIds, {
          type: "status_changed",
          task_id: id,
          task_title: title,
          sender_id: req.user.id,
          message: `Task "${title}" status changed to ${statusLabels[status] || status}`,
          new_status: status,
        }, req.user.id);
      }

      if (old.description !== description) {
        await pushTaskNotification(affectedIds, {
          type: "description_changed",
          task_id: id,
          task_title: title,
          sender_id: req.user.id,
          message: `Task "${title}" description was updated`,
        }, req.user.id);
      }

      if (String(old.client_id ?? '') !== String(client_id ?? '')) {
        let clientLabel = null;
        if (client_id) {
          const cr = await pool.query("SELECT full_name FROM clients WHERE id=$1", [client_id]);
          clientLabel = cr.rows[0]?.full_name || null;
        }
        await pushTaskNotification(affectedIds, {
          type: "linked_client_changed",
          task_id: id,
          task_title: title,
          sender_id: req.user.id,
          message: clientLabel
            ? `Task "${title}" linked client changed to ${clientLabel}`
            : `Task "${title}" linked client was removed`,
        }, req.user.id);
      }

      if (String(old.order_id ?? '') !== String(order_id ?? '')) {
        let orderLabel = null;
        if (order_id) {
          const or = await pool.query("SELECT job_id FROM orders WHERE id=$1", [order_id]);
          orderLabel = or.rows[0]?.job_id || null;
        }
        await pushTaskNotification(affectedIds, {
          type: "linked_order_changed",
          task_id: id,
          task_title: title,
          sender_id: req.user.id,
          message: orderLabel
            ? `Task "${title}" linked order changed to ${orderLabel}`
            : `Task "${title}" linked order was removed`,
        }, req.user.id);
      }

      // Notify newly added assignees
      if (assignees && assignees.length > 0) {
        const oldAssigneeIds = new Set(assigneeIds);
        const newAssigneeIds = assignees.filter(uid => !oldAssigneeIds.has(uid));
        if (newAssigneeIds.length) {
          await pushTaskNotification(newAssigneeIds, {
            type: "assigned",
            task_id: id,
            task_title: title,
            sender_id: req.user.id,
            message: `You have been assigned to task "${title}"`,
          }, req.user.id);
        }
      }

      res.json({ success: true });
    } else {
      const result = await pool.query(
        `INSERT INTO tasks (title, description, created_by, client_id, order_id, status, due_date)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        [title, description, created_by, client_id, order_id, status, due_date || null]
      );

      const newTask = result.rows[0];

      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO task_assignees (task_id, user_id) VALUES ($1,$2)",
            [newTask.id, user_id]
          );
        }
        // Notify all assignees of new task
        await pushTaskNotification(assignees, {
          type: "assigned",
          task_id: newTask.id,
          task_title: title,
          sender_id: req.user.id,
          message: `You have been assigned to a new task: "${title}"`,
        }, req.user.id);
      }

      await logActivity({ userId: req.user.id, action: "created", entityType: "task", entityId: newTask.id, entityLabel: title });
      res.json(newTask);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Reorder tasks
router.post("/reorder", authenticate, async (req, res) => {
  const { orderedIds } = req.body;
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await pool.query("UPDATE tasks SET sort_order=$1 WHERE id=$2", [i, orderedIds[i]]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Archive task
router.post("/archive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT title FROM tasks WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE tasks SET is_archived=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "archived", entityType: "task", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.title });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Unarchive task (restore)
router.post("/unarchive/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const r = await pool.query("SELECT title FROM tasks WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE tasks SET is_archived=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "task", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.title });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Trash task (superadmin only)
router.post("/trash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT title FROM tasks WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE tasks SET is_deleted=TRUE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "trashed", entityType: "task", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.title });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Untrash task (superadmin only)
router.post("/untrash/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT title FROM tasks WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE tasks SET is_deleted=FALSE WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "restored", entityType: "task", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.title });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Permanently delete task (superadmin only)
router.post("/permanent-delete/:id", authenticate, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });
  try {
    const r = await pool.query("SELECT title FROM tasks WHERE id=$1", [req.params.id]);
    await logActivity({ userId: req.user.id, action: "deleted", entityType: "task", entityId: parseInt(req.params.id), entityLabel: r.rows[0]?.title });
    await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
