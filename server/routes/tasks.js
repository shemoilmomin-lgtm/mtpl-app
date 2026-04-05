const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all tasks with assignees
router.get("/", authenticate, async (req, res) => {
  try {
    const tasks = await pool.query(
      "SELECT * FROM tasks ORDER BY sort_order ASC, created_at DESC"
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
    res.status(500).json({ error: "Server error" });
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
    status,
    assignees, // array of user IDs
  } = req.body;

  try {
    if (id) {
      await pool.query(
        `UPDATE tasks SET
          title=$1, description=$2,
          client_id=$3, order_id=$4, status=$5
        WHERE id=$6`,
        [title, description, client_id, order_id, status, id]
      );

      // Update assignees
      await pool.query("DELETE FROM task_assignees WHERE task_id=$1", [id]);
      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO task_assignees (task_id, user_id) VALUES ($1,$2)",
            [id, user_id]
          );
        }
      }

      res.json({ success: true });
    } else {
      const result = await pool.query(
        `INSERT INTO tasks (title, description, created_by, client_id, order_id, status)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [title, description, created_by, client_id, order_id, status]
      );

      const newTask = result.rows[0];

      // Insert assignees
      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO task_assignees (task_id, user_id) VALUES ($1,$2)",
            [newTask.id, user_id]
          );
        }
      }

      res.json(newTask);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
    res.status(500).json({ error: "Server error" });
  }
});

// Delete task
router.post("/delete/:id", authenticate, async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;