const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all orders with assignees
router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    const assignees = await pool.query(
      `SELECT oa.order_id, u.id, u.name FROM order_assignees oa
      JOIN users u ON u.id = oa.user_id`
    );

    const result = orders.rows.map(o => ({
      ...o,
      assignees: assignees.rows.filter(a => a.order_id === o.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create or update order
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    client_id,
    project_name,
    job_type,
    quantity,
    specifications,
    delivery_expected,
    quotation_ref_id,
    quotation_manual_no,
    quotation_manual_amount,
    advance,
    prepared_by,
    status,
    notes,
    assignees,
  } = req.body;

  const quotationAmount = parseFloat(quotation_manual_amount) || 0;
  const advanceAmount = parseFloat(advance) || 0;
  const balance = quotationAmount - advanceAmount;

  try {
    if (id) {
      await pool.query(
        `UPDATE orders SET
          client_id=$1, project_name=$2, job_type=$3, quantity=$4,
          specifications=$5, delivery_expected=$6,
          quotation_ref_id=$7, quotation_manual_no=$8, quotation_manual_amount=$9,
          advance=$10, balance=$11, prepared_by=$12, status=$13, notes=$14
        WHERE id=$15`,
        [
          client_id, project_name, job_type, quantity,
          specifications, delivery_expected,
          quotation_ref_id, quotation_manual_no, quotationAmount,
          advanceAmount, balance, prepared_by, status, notes, id
        ]
      );

      await pool.query("DELETE FROM order_assignees WHERE order_id=$1", [id]);
      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO order_assignees (order_id, user_id) VALUES ($1,$2)",
            [id, user_id]
          );
        }
      }

      res.json({ success: true });
    } else {
      const today = new Date();
      const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE"
      );
      const count = parseInt(countResult.rows[0].count) + 1;
      const job_id = `${datePart}-${String(count).padStart(3, "0")}`;

      const result = await pool.query(
        `INSERT INTO orders (
          job_id, client_id, project_name, job_type, quantity,
          specifications, delivery_expected,
          quotation_ref_id, quotation_manual_no, quotation_manual_amount,
          advance, balance, prepared_by, status, notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *`,
        [
          job_id, client_id, project_name, job_type, quantity,
          specifications, delivery_expected,
          quotation_ref_id, quotation_manual_no, quotationAmount,
          advanceAmount, balance, prepared_by, status, notes
        ]
      );

      const newOrder = result.rows[0];

      if (assignees && assignees.length > 0) {
        for (const user_id of assignees) {
          await pool.query(
            "INSERT INTO order_assignees (order_id, user_id) VALUES ($1,$2)",
            [newOrder.id, user_id]
          );
        }
      }

      res.json(newOrder);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Duplicate order
router.post("/duplicate/:id", authenticate, async (req, res) => {
  try {
    const original = await pool.query("SELECT * FROM orders WHERE id=$1", [req.params.id]);
    if (original.rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const o = original.rows[0];

    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const job_id = `${datePart}-${String(count).padStart(3, "0")}`;

    const result = await pool.query(
      `INSERT INTO orders (
        job_id, client_id, project_name, job_type, quantity,
        specifications, delivery_expected,
        quotation_ref_id, quotation_manual_no, quotation_manual_amount,
        advance, balance, prepared_by, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        job_id, o.client_id, o.project_name, o.job_type, o.quantity,
        o.specifications, o.delivery_expected,
        o.quotation_ref_id, o.quotation_manual_no, o.quotation_manual_amount,
        o.advance, o.balance, o.prepared_by, o.status, o.notes
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Archive order
router.post("/archive/:id", authenticate, async (req, res) => {
  try {
    await pool.query("UPDATE orders SET is_archived=TRUE WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Trash order
router.post("/trash/:id", authenticate, async (req, res) => {
  try {
    await pool.query("UPDATE orders SET is_deleted=TRUE WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;