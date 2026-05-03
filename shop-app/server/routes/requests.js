import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

const REQUEST_STATUSES = new Set([
  'Pending',
  'Fulfilled',
  'Partially Fulfilled',
  'Cancelled',
]);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.request_id, r.student_id, r.status, s.name AS student_name, s.email AS student_email
       FROM request r
       INNER JOIN student s ON s.student_id = r.student_id
       ORDER BY r.request_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.get('/student/:student_id', async (req, res) => {
  const studentId = Number.parseInt(req.params.student_id, 10);
  if (Number.isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student_id' });
  }
  try {
    const result = await pool.query(
      `SELECT request_id, student_id, status
       FROM request
       WHERE student_id = $1
       ORDER BY request_id`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests for student' });
  }
});

function mergeRequestItems(items) {
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
  const { student_id, status, items } = req.body ?? {};
  const sid = Number(student_id);
  if (!Number.isInteger(sid)) {
    return res.status(400).json({ error: 'student_id must be an integer' });
  }
  const effectiveStatus =
    status === undefined || status === null ? 'Pending' : String(status);
  if (!REQUEST_STATUSES.has(effectiveStatus)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const hasItems = items !== undefined && items !== null;
  if (hasItems && !Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array when provided' });
  }
  let lines = [];
  if (hasItems && items.length > 0) {
    const merged = mergeRequestItems(items);
    if (merged.error) {
      return res.status(400).json({ error: merged.error });
    }
    lines = merged.lines;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reqRow = await client.query(
      `INSERT INTO request (student_id, status)
       VALUES ($1, $2)
       RETURNING request_id, student_id, status`,
      [sid, effectiveStatus]
    );
    const request_id = reqRow.rows[0].request_id;

    for (const row of lines) {
      await client.query(
        `INSERT INTO request_item (request_id, item_id, quantity)
         VALUES ($1, $2, $3)`,
        [request_id, row.item_id, row.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(reqRow.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid student_id or item_id' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Check constraint failed' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create request' });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', async (req, res) => {
  const requestId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(requestId)) {
    return res.status(400).json({ error: 'Invalid request id' });
  }
  const { status } = req.body ?? {};
  if (typeof status !== 'string' || !REQUEST_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Valid status is required' });
  }
  try {
    const result = await pool.query(
      `UPDATE request
       SET status = $1
       WHERE request_id = $2
       RETURNING request_id, student_id, status`,
      [status, requestId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

export default router;
