import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT student_id, name, email, phone_number, dietary_restrictions
       FROM student
       ORDER BY student_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/:id', async (req, res) => {
  const studentId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student id' });
  }
  try {
    const result = await pool.query(
      `SELECT student_id, name, email, phone_number, dietary_restrictions
       FROM student
       WHERE student_id = $1`,
      [studentId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

router.post('/', async (req, res) => {
  const { student_id, name, email, phone_number, dietary_restrictions } = req.body ?? {};
  const sid = Number(student_id);
  if (!Number.isInteger(sid)) {
    return res.status(400).json({ error: 'student_id must be an integer' });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email is required' });
  }
  const phone =
    phone_number === undefined || phone_number === null || phone_number === ''
      ? null
      : String(phone_number);
  const dietary =
    dietary_restrictions === undefined || dietary_restrictions === null
      ? null
      : String(dietary_restrictions);
  try {
    const result = await pool.query(
      `INSERT INTO student (student_id, name, email, phone_number, dietary_restrictions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING student_id, name, email, phone_number, dietary_restrictions`,
      [sid, name.trim(), email.trim(), phone, dietary]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email or student_id already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/:id', async (req, res) => {
  const studentId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student id' });
  }
  const { name, email, phone_number, dietary_restrictions } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email is required' });
  }
  const phone =
    phone_number === undefined || phone_number === null || phone_number === ''
      ? null
      : String(phone_number);
  const dietary =
    dietary_restrictions === undefined || dietary_restrictions === null
      ? null
      : String(dietary_restrictions);
  try {
    const result = await pool.query(
      `UPDATE student
       SET name = $1, email = $2, phone_number = $3, dietary_restrictions = $4
       WHERE student_id = $5
       RETURNING student_id, name, email, phone_number, dietary_restrictions`,
      [name.trim(), email.trim(), phone, dietary, studentId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

export default router;
