const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

// Get all quotations with their line items
router.get("/", authenticate, async (req, res) => {
  try {
    const quotations = await pool.query(
      "SELECT * FROM quotations ORDER BY created_at DESC"
    );
    const items = await pool.query(
      "SELECT * FROM quotation_items ORDER BY quotation_id, sort_order ASC"
    );

    const result = quotations.rows.map(q => ({
      ...q,
      items: items.rows.filter(i => i.quotation_id === q.id)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create or update quotation
router.post("/save", authenticate, async (req, res) => {
  const {
    id,
    client_id,
    date,
    tax_mode,
    show_tax_details,
    terms_and_conditions,
    signature_block,
    created_by,
    items,
  } = req.body;

  try {
    if (id) {
      // Update quotation
      await pool.query(
        `UPDATE quotations SET
          client_id=$1, date=$2, tax_mode=$3,
          show_tax_details=$4, terms_and_conditions=$5, signature_block=$6
        WHERE id=$7`,
        [client_id, date, tax_mode, show_tax_details, terms_and_conditions, signature_block, id]
      );

      // Replace line items
      await pool.query("DELETE FROM quotation_items WHERE quotation_id=$1", [id]);
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const { description, quantity, rate, amount } = items[i];
          await pool.query(
            `INSERT INTO quotation_items (quotation_id, description, quantity, rate, amount, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6)`,
            [id, description, quantity, rate, amount, i]
          );
        }
      }
      res.json({ success: true });
    } else {
      // Generate quotation_id
      const countResult = await pool.query("SELECT COUNT(*) FROM quotations");
      const count = parseInt(countResult.rows[0].count) + 1;
      const quotation_id = `QT-${String(count).padStart(4, "0")}`;

      const result = await pool.query(
        `INSERT INTO quotations (quotation_id, client_id, date, tax_mode, show_tax_details, terms_and_conditions, signature_block, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`,
        [quotation_id, client_id, date, tax_mode, show_tax_details, terms_and_conditions, signature_block, created_by]
      );

      const newQuotation = result.rows[0];

      // Insert line items
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const { description, quantity, rate, amount } = items[i];
          await pool.query(
            `INSERT INTO quotation_items (quotation_id, description, quantity, rate, amount, sort_order)
            VALUES ($1,$2,$3,$4,$5,$6)`,
            [newQuotation.id, description, quantity, rate, amount, i]
          );
        }
      }

      res.json(newQuotation);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Duplicate quotation
router.post("/duplicate/:id", authenticate, async (req, res) => {
  try {
    const original = await pool.query("SELECT * FROM quotations WHERE id=$1", [req.params.id]);
    if (original.rows.length === 0) return res.status(404).json({ error: "Quotation not found" });

    const q = original.rows[0];

    const countResult = await pool.query("SELECT COUNT(*) FROM quotations");
    const count = parseInt(countResult.rows[0].count) + 1;
    const quotation_id = `QT-${String(count).padStart(4, "0")}`;

    const result = await pool.query(
      `INSERT INTO quotations (quotation_id, client_id, date, tax_mode, show_tax_details, terms_and_conditions, signature_block, created_by)
      VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7)
      RETURNING *`,
      [quotation_id, q.client_id, q.tax_mode, q.show_tax_details, q.terms_and_conditions, q.signature_block, q.created_by]
    );

    const newQuotation = result.rows[0];

    // Copy line items
    const originalItems = await pool.query(
      "SELECT * FROM quotation_items WHERE quotation_id=$1 ORDER BY sort_order ASC",
      [q.id]
    );

    for (let i = 0; i < originalItems.rows.length; i++) {
      const item = originalItems.rows[i];
      await pool.query(
        `INSERT INTO quotation_items (quotation_id, description, quantity, rate, amount, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [newQuotation.id, item.description, item.quantity, item.rate, item.amount, i]
      );
    }

    res.json(newQuotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete quotation
router.post("/delete/:id", authenticate, async (req, res) => {
  try {
    await pool.query("DELETE FROM quotations WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
