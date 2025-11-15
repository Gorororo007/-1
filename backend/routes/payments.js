import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// получить все платежи
router.get('/', async (req, res) => {
  try {
    const { order_id: ordId } = req.query;
    let query = `
      SELECT 
        p.*,
        o.order_id,
        o.user_id,
        o.total_amount as order_total,
        o.order_status,
        u.email,
        u.first_name,
        u.last_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.order_id
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCnt = 0;

    if (ordId) {
      paramCnt++;
      query += ` AND p.order_id = $${paramCnt}`;
      params.push(ordId);
    }

    query += ` ORDER BY p.payment_date DESC`;

    const rslt = await pool.query(query, params);
    res.json(rslt.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// обновить статус платежа
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status: pymtSts, transaction_number: trnsNum } = req.body;

    if (!pymtSts) {
      return res.status(400).json({ error: 'payment_status обязателен' });
    }

    const validSts = ['pending', 'paid', 'failed', 'refunded'];
    if (!validSts.includes(pymtSts)) {
      return res.status(400).json({ error: 'Некорректный статус платежа' });
    }

    const updateFields = ['payment_status = $1'];
    const params = [pymtSts];
    let paramCnt = 1;

    if (pymtSts === 'paid') {
      paramCnt++;
      updateFields.push(`payment_date = CURRENT_TIMESTAMP`);
    }

    if (trnsNum) {
      paramCnt++;
      updateFields.push(`transaction_number = $${paramCnt}`);
      params.push(trnsNum);
    }

    params.push(id);
    const query = `UPDATE payments SET ${updateFields.join(', ')} WHERE payment_id = $${paramCnt + 1} RETURNING *`;

    const rslt = await pool.query(query, params);

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Платеж не найден' });
    }

    res.json(rslt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// создать новый платеж
router.post('/', async (req, res) => {
  try {
    const { order_id: ordId, payment_amount: pymtAmt, transaction_number: trnsNum } = req.body;

    if (!ordId || !pymtAmt || pymtAmt <= 0) {
      return res.status(400).json({ error: 'order_id и payment_amount обязательны' });
    }

    // проверяем что заказ существует
    const ordRslt = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [ordId]
    );

    if (ordRslt.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // создаем платеж
    const rslt = await pool.query(
      `INSERT INTO payments (order_id, payment_amount, payment_status, payment_date, transaction_number)
       VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, $3) RETURNING *`,
      [ordId, pymtAmt, trnsNum || null]
    );

    res.status(201).json(rslt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// получить платеж по id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rslt = await pool.query(
      `SELECT 
        p.*,
        o.order_id,
        o.user_id,
        o.total_amount as order_total,
        o.order_status,
        u.email,
        u.first_name,
        u.last_name
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.order_id
       LEFT JOIN users u ON o.user_id = u.user_id
       WHERE p.payment_id = $1`,
      [id]
    );

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Платеж не найден' });
    }

    res.json(rslt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
