import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.donation_id, d.donor_id, d.donated_at, dr.name AS donor_name, dr.email AS donor_email
       FROM donation d
       INNER JOIN donor dr ON dr.donor_id = d.donor_id
       ORDER BY d.donated_at DESC, d.donation_id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

function mergeDonationItems(items) {
  const map = new Map();
  for (const row of items) {
    const itemId = Number(row?.item_id);
    const quantity = Number(row?.quantity_received);
    if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity <= 0) {
      return {
        error:
          'Each item must have integer item_id and positive integer quantity_received',
      };
    }
    const exp =
      row.expiration_date === undefined || row.expiration_date === null || row.expiration_date === ''
        ? null
        : String(row.expiration_date);
    if (map.has(itemId)) {
      const prev = map.get(itemId);
      prev.quantity_received += quantity;
      if (exp !== null) {
        prev.expiration_date = exp;
      }
    } else {
      map.set(itemId, { item_id: itemId, quantity_received: quantity, expiration_date: exp });
    }
  }
  return { lines: [...map.values()] };
}

router.post('/', async (req, res) => {
  const { donor_id, donated_at, items } = req.body ?? {};
  const donorId = Number(donor_id);
  if (!Number.isInteger(donorId)) {
    return res.status(400).json({ error: 'donor_id must be an integer' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }
  const merged = mergeDonationItems(items);
  if (merged.error) {
    return res.status(400).json({ error: merged.error });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const donationRow = await client.query(
      `INSERT INTO donation (donor_id, donated_at)
       VALUES ($1, COALESCE($2::timestamp, CURRENT_TIMESTAMP))
       RETURNING donation_id, donor_id, donated_at`,
      [donorId, donated_at ?? null]
    );
    const donation_id = donationRow.rows[0].donation_id;

    for (const row of merged.lines) {
      await client.query(
        `INSERT INTO donation_item (donation_id, item_id, quantity_received, expiration_date)
         VALUES ($1, $2, $3, $4)`,
        [donation_id, row.item_id, row.quantity_received, row.expiration_date]
      );

      const upd = await client.query(
        `UPDATE item
         SET quantity_available = quantity_available + $1
         WHERE item_id = $2
         RETURNING item_id, quantity_available`,
        [row.quantity_received, row.item_id]
      );
      if (upd.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Item not found', item_id: row.item_id });
      }
    }

    await client.query('COMMIT');
    res.status(201).json(donationRow.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid donor_id or item_id' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create donation' });
  } finally {
    client.release();
  }
});

export default router;
