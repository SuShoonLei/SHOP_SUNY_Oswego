import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT transaction_id, student_id, volunteer_id, date_time, notes
       FROM "transaction"
       ORDER BY date_time DESC, transaction_id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/:id', async (req, res) => {
  const transactionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(transactionId)) {
    return res.status(400).json({ error: 'Invalid transaction id' });
  }
  try {
    const header = await pool.query(
      `SELECT transaction_id, student_id, volunteer_id, date_time, notes
       FROM "transaction"
       WHERE transaction_id = $1`,
      [transactionId]
    );
    if (header.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const items = await pool.query(
      `SELECT ti.item_id, ti.quantity, i.item_name, i.category, i.quantity_available
       FROM transaction_item ti
       INNER JOIN item i ON i.item_id = ti.item_id
       WHERE ti.transaction_id = $1
       ORDER BY ti.item_id`,
      [transactionId]
    );
    res.json({
      ...header.rows[0],
      items: items.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

function mergeItemQuantities(items) {
  const map = new Map();
  for (const row of items) {
    const itemId = Number(row?.item_id);
    const quantity = Number(row?.quantity);
    if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity <= 0) {
      return { error: 'Each item must have integer item_id and positive integer quantity' };
    }
    map.set(itemId, (map.get(itemId) ?? 0) + quantity);
  }
  return { lines: [...map.entries()].map(([item_id, quantity]) => ({ item_id, quantity })) };
}

router.post('/', async (req, res) => {
  const { student_id, volunteer_id, notes, date_time, items } = req.body ?? {};
  const sid = Number(student_id);
  const vid = Number(volunteer_id);
  if (!Number.isInteger(sid)) {
    return res.status(400).json({ error: 'student_id must be an integer' });
  }
  if (!Number.isInteger(vid)) {
    return res.status(400).json({ error: 'volunteer_id must be an integer' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }
  const merged = mergeItemQuantities(items);
  if (merged.error) {
    return res.status(400).json({ error: merged.error });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertTx = await client.query(
      `INSERT INTO "transaction" (student_id, volunteer_id, notes, date_time)
       VALUES ($1, $2, $3, COALESCE($4::timestamp, CURRENT_TIMESTAMP))
       RETURNING transaction_id, student_id, volunteer_id, date_time, notes`,
      [
        sid,
        vid,
        notes === undefined || notes === null ? null : String(notes),
        date_time ?? null,
      ]
    );
    const transaction_id = insertTx.rows[0].transaction_id;

    for (const row of merged.lines) {
      const itemId = row.item_id;
      const quantity = row.quantity;

      await client.query(
        `INSERT INTO transaction_item (transaction_id, item_id, quantity)
         VALUES ($1, $2, $3)`,
        [transaction_id, itemId, quantity]
      );

      const stock = await client.query(
        `UPDATE item
         SET quantity_available = quantity_available - $1
         WHERE item_id = $2 AND quantity_available >= $1
         RETURNING item_id, quantity_available`,
        [quantity, itemId]
      );
      if (stock.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'Insufficient stock or item not found',
          item_id: itemId,
        });
      }
    }

    await client.query('COMMIT');
    res.status(201).json(insertTx.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid student_id or volunteer_id' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  } finally {
    client.release();
  }
});

export default router;
