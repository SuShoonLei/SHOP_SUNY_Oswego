import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT donor_id, name, email, phone_number
       FROM donor
       ORDER BY donor_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch donors' });
  }
});

export default router;
