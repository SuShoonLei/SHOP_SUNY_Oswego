import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

const TRAINING_STATUSES = new Set(['Not Started', 'In Progress', 'Completed']);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT volunteer_id, name, email, phone, training_status
       FROM volunteer
       ORDER BY volunteer_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, training_status } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email is required' });
  }
  const phoneVal =
    phone === undefined || phone === null || phone === '' ? null : String(phone);
  const training =
    training_status === undefined || training_status === null || training_status === ''
      ? null
      : String(training_status);
  if (training !== null && !TRAINING_STATUSES.has(training)) {
    return res.status(400).json({ error: 'Invalid training_status' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO volunteer (name, email, phone, training_status)
       VALUES ($1, $2, $3, $4)
       RETURNING volunteer_id, name, email, phone, training_status`,
      [name.trim(), email.trim(), phoneVal, training]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Invalid training_status' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create volunteer' });
  }
});

router.get('/:id/shifts', async (req, res) => {
  const volunteerId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(volunteerId)) {
    return res.status(400).json({ error: 'Invalid volunteer id' });
  }
  try {
    const result = await pool.query(
      `SELECT shift_id, volunteer_id, shift_date, start_time, end_time
       FROM volunteer_shift
       WHERE volunteer_id = $1
       ORDER BY shift_date, start_time`,
      [volunteerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

/** Mounted at POST /api/volunteer-shifts */
export const volunteerShiftsRouter = Router();

volunteerShiftsRouter.post('/', async (req, res) => {
  const { volunteer_id, shift_date, start_time, end_time } = req.body ?? {};
  const vid = Number(volunteer_id);
  if (!Number.isInteger(vid)) {
    return res.status(400).json({ error: 'volunteer_id must be an integer' });
  }
  if (typeof shift_date !== 'string' || !shift_date.trim()) {
    return res.status(400).json({ error: 'shift_date is required (YYYY-MM-DD)' });
  }
  if (typeof start_time !== 'string' || !start_time.trim()) {
    return res.status(400).json({ error: 'start_time is required (HH:MM:SS or HH:MM)' });
  }
  if (typeof end_time !== 'string' || !end_time.trim()) {
    return res.status(400).json({ error: 'end_time is required (HH:MM:SS or HH:MM)' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO volunteer_shift (volunteer_id, shift_date, start_time, end_time)
       VALUES ($1, $2::date, $3::time, $4::time)
       RETURNING shift_id, volunteer_id, shift_date, start_time, end_time`,
      [vid, shift_date.trim(), start_time.trim(), end_time.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid volunteer_id' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'end_time must be after start_time' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create volunteer shift' });
  }
});

export default router;
