import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// получить все купоны (с фильтром)
router.get('/', async (req, res) => {
  try {
    const { user_id, product_id, status } = req.query;
    let query = 'SELECT * FROM coupons WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (product_id) {
      paramCount++;
      query += ` AND product_id = $${paramCount}`;
      params.push(product_id);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY start_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// получить купон по id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM coupons WHERE coupon_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Купон не найден' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// получить купон по коду
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      'SELECT * FROM coupons WHERE coupon_code = $1',
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Купон не найден' });
    }
    const coupon = result.rows[0];
    
    // проверка активности купона
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (now < startDate || now > endDate || coupon.status !== 'active') {
      return res.status(400).json({ error: 'Купон недействителен' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// создать новый купон
router.post('/', async (req, res) => {
  try {
    const { coupon_code, discount_type, discount_value, start_date, end_date, status, user_id, product_id } = req.body;
    
    if (!coupon_code || !discount_type || !discount_value || !start_date || !end_date) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    if (discount_type !== 'percentage' && discount_type !== 'fixed_amount') {
      return res.status(400).json({ error: 'Тип скидки должен быть "percentage" или "fixed_amount"' });
    }

    const result = await pool.query(
      `INSERT INTO coupons (coupon_code, discount_type, discount_value, start_date, end_date, status, user_id, product_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        coupon_code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status || 'active',
        user_id || null,
        product_id || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // нарушение уникальности
      res.status(409).json({ error: 'Купон с таким кодом уже существует' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// обновить купон
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { coupon_code, discount_type, discount_value, start_date, end_date, status, user_id, product_id } = req.body;

    const result = await pool.query(
      `UPDATE coupons 
       SET coupon_code = COALESCE($1, coupon_code),
           discount_type = COALESCE($2, discount_type),
           discount_value = COALESCE($3, discount_value),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           status = COALESCE($6, status),
           user_id = COALESCE($7, user_id),
           product_id = COALESCE($8, product_id)
       WHERE coupon_id = $9 RETURNING *`,
      [coupon_code, discount_type, discount_value, start_date, end_date, status, user_id, product_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Купон не найден' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// удалить купон
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM coupons WHERE coupon_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Купон не найден' });
    }
    res.json({ message: 'Купон удален', coupon: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

