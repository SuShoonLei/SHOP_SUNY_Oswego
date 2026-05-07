import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

/** SELECT … WHERE … ORDER BY — low inventory */
router.get('/low-stock', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT item_id, item_name, category, quantity_available
       FROM item
       WHERE quantity_available < 5
       ORDER BY quantity_available ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load low-stock report' });
  }
});

/** JOIN + GROUP BY + SUM + ORDER BY DESC + LIMIT — top requested items */
router.get('/top-requested', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ri.item_id,
              i.item_name,
              SUM(ri.quantity)::bigint AS total_requested
       FROM request_item ri
       INNER JOIN item i ON i.item_id = ri.item_id
       GROUP BY ri.item_id, i.item_name
       ORDER BY total_requested DESC
       LIMIT 5`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load top-requested report' });
  }
});

/** JOIN + GROUP BY + COUNT + ORDER BY — volunteer transaction counts */
router.get('/volunteer-activity', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.volunteer_id,
              v.name,
              COUNT(t.transaction_id)::bigint AS transaction_count
       FROM volunteer v
       LEFT JOIN "transaction" t ON t.volunteer_id = v.volunteer_id
       GROUP BY v.volunteer_id, v.name
       ORDER BY transaction_count DESC, v.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load volunteer activity report' });
  }
});

/** Multi-table JOIN — transactions for one student with line items */
router.get('/student-transactions/:student_id', async (req, res) => {
  const studentId = Number.parseInt(req.params.student_id, 10);
  if (Number.isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student_id' });
  }
  try {
    const result = await pool.query(
      `SELECT t.transaction_id,
              t.date_time,
              t.notes,
              s.student_id,
              s.name AS student_name,
              ti.item_id,
              ti.quantity,
              i.item_name,
              i.category
       FROM "transaction" t
       INNER JOIN student s ON s.student_id = t.student_id
       INNER JOIN transaction_item ti ON ti.transaction_id = t.transaction_id
       INNER JOIN item i ON i.item_id = ti.item_id
       WHERE t.student_id = $1
       ORDER BY t.date_time DESC, ti.item_id ASC`,
      [studentId]
    );

    const byTx = new Map();
    for (const row of result.rows) {
      const id = row.transaction_id;
      if (!byTx.has(id)) {
        byTx.set(id, {
          transaction_id: id,
          date_time: row.date_time,
          notes: row.notes,
          student_id: row.student_id,
          student_name: row.student_name,
          items: [],
        });
      }
      byTx.get(id).items.push({
        item_id: row.item_id,
        item_name: row.item_name,
        category: row.category,
        quantity: row.quantity,
      });
    }
    res.json([...byTx.values()]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load student transactions report' });
  }
});

/** JOIN donor → donation → donation_item, GROUP BY donor, COUNT + SUM */
router.get('/donation-summary', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dr.donor_id,
              dr.name AS donor_name,
              COUNT(DISTINCT dn.donation_id)::bigint AS donation_count,
              COALESCE(SUM(di.quantity_received), 0)::bigint AS total_items_donated
       FROM donor dr
       LEFT JOIN donation dn ON dn.donor_id = dr.donor_id
       LEFT JOIN donation_item di ON di.donation_id = dn.donation_id
       GROUP BY dr.donor_id, dr.name
       ORDER BY dr.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load donation summary report' });
  }
});

/** LEFT JOIN + WHERE IS NULL — items in inventory never requested */
router.get('/never-requested', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.item_id,
              i.item_name,
              i.category AS category_id
       FROM item i
       LEFT JOIN request_item ri ON i.item_id = ri.item_id
       WHERE ri.item_id IS NULL
       ORDER BY i.item_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load never-requested items report' });
  }
});

/** LEFT JOIN + WHERE IS NULL — volunteers without scheduled shifts */
router.get('/unscheduled-volunteers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.volunteer_id,
              v.name,
              v.training_status
       FROM volunteer v
       LEFT JOIN volunteer_shift vs ON v.volunteer_id = vs.volunteer_id
       WHERE vs.volunteer_id IS NULL`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load unscheduled volunteers report' });
  }
});

export default router;
