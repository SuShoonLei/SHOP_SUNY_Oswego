import { Router } from 'express';
import pool from '../db/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT item_id, item_name, category, quantity_available
       FROM item
       ORDER BY item_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/:id', async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }
  try {
    const result = await pool.query(
      `SELECT item_id, item_name, category, quantity_available
       FROM item
       WHERE item_id = $1`,
      [itemId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/', async (req, res) => {
  const { item_name, category, quantity_available } = req.body ?? {};
  if (typeof item_name !== 'string' || !item_name.trim()) {
    return res.status(400).json({ error: 'item_name is required' });
  }
  if (typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ error: 'category is required' });
  }
  const qty =
    quantity_available !== undefined && quantity_available !== null
      ? Number(quantity_available)
      : 0;
  if (!Number.isInteger(qty) || qty < 0) {
    return res.status(400).json({ error: 'quantity_available must be a non-negative integer' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO item (item_name, category, quantity_available)
       VALUES ($1, $2, $3)
       RETURNING item_id, item_name, category, quantity_available`,
      [item_name.trim(), category.trim(), qty]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/:id', async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }
  const { quantity_available, category } = req.body ?? {};
  if (typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ error: 'category is required' });
  }
  if (quantity_available === undefined || quantity_available === null) {
    return res.status(400).json({ error: 'quantity_available is required' });
  }
  const qty = Number(quantity_available);
  if (!Number.isInteger(qty) || qty < 0) {
    return res.status(400).json({ error: 'quantity_available must be a non-negative integer' });
  }
  try {
    const result = await pool.query(
      `UPDATE item
       SET quantity_available = $1, category = $2
       WHERE item_id = $3
       RETURNING item_id, item_name, category, quantity_available`,
      [qty, category.trim(), itemId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }
  try {
    const result = await pool.query(`DELETE FROM item WHERE item_id = $1 RETURNING item_id`, [
      itemId,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
