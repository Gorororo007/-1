import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// удалить категорию
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM categories WHERE category_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json({ message: 'Категория удалена', category: result.rows[0] });
  } catch (error) {
    if (error.code === '23503') { // нарушение внешнего ключа
      res.status(409).json({ error: 'Невозможно удалить категорию, так как она используется в товарах' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// обновить категорию
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description, display_order } = req.body;

    const result = await pool.query(
      `UPDATE categories 
       SET category_name = COALESCE($1, category_name),
           description = COALESCE($2, description),
           display_order = COALESCE($3, display_order)
       WHERE category_id = $4 RETURNING *`,
      [category_name, description, display_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// получить категорию по id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM categories WHERE category_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// создать новую категорию
router.post('/', async (req, res) => {
  try {
    const { category_name, description, display_order } = req.body;
    
    if (!category_name) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO categories (category_name, description, display_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [category_name, description || null, display_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // нарушение уникальности
      res.status(409).json({ error: 'Категория с таким названием уже существует' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// получить все категории
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY display_order, category_name'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

