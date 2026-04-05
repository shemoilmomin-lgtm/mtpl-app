const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all clients
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clients ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create or update client
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    full_name,
    company_name,
    gst_number,
    contact_1_name, contact_1_no,
    contact_2_name, contact_2_no,
    contact_3_name, contact_3_no,
    contact_4_name, contact_4_no,
    accountant_name, accountant_no,
    email,
    address,
  } = req.body;

  try {
    if (id) {
      // Update
      await pool.query(
        `UPDATE clients SET
          full_name=$1, company_name=$2, gst_number=$3,
          contact_1_name=$4, contact_1_no=$5,
          contact_2_name=$6, contact_2_no=$7,
          contact_3_name=$8, contact_3_no=$9,
          contact_4_name=$10, contact_4_no=$11,
          accountant_name=$12, accountant_no=$13,
          email=$14, address=$15
        WHERE id=$16`,
        [
          full_name, company_name, gst_number,
          contact_1_name, contact_1_no,
          contact_2_name, contact_2_no,
          contact_3_name, contact_3_no,
          contact_4_name, contact_4_no,
          accountant_name, accountant_no,
          email, address, id
        ]
      );
      res.json({ success: true });
    } else {
      // Generate client_id
      const countResult = await pool.query("SELECT COUNT(*) FROM clients");
      const count = parseInt(countResult.rows[0].count) + 1;
      const client_id = `CLT-${String(count).padStart(4, "0")}`;

      const result = await pool.query(
        `INSERT INTO clients (
          client_id, full_name, company_name, gst_number,
          contact_1_name, contact_1_no,
          contact_2_name, contact_2_no,
          contact_3_name, contact_3_no,
          contact_4_name, contact_4_no,
          accountant_name, accountant_no,
          email, address
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING *`,
        [
          client_id, full_name, company_name, gst_number,
          contact_1_name, contact_1_no,
          contact_2_name, contact_2_no,
          contact_3_name, contact_3_no,
          contact_4_name, contact_4_no,
          accountant_name, accountant_no,
          email, address
        ]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;