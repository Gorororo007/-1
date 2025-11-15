import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// получить все заказы (для админа) или заказы пользователя
router.get('/', async (req, res) => {
  try {
    const { user_id: usrId } = req.query;
    let query = `
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email,
        pm.payment_status,
        pm.transaction_number,
        pm.payment_amount,
        COALESCE(
          json_agg(
            json_build_object(
              'order_item_id', oi.order_item_id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price_at_order,
              'price_at_order', oi.price_at_order,
              'item_total', oi.item_total,
              'product_name', p.name,
              'product_author', p.author
            )
          ) FILTER (WHERE oi.order_item_id IS NOT NULL),
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN LATERAL (
        SELECT payment_status, transaction_number, payment_amount
        FROM payments
        WHERE payments.order_id = o.order_id
        ORDER BY payments.payment_date DESC
        LIMIT 1
      ) pm ON true
      WHERE 1=1
    `;
    const params = [];
    let paramCnt = 0;

    if (usrId) {
      paramCnt++;
      query += ` AND o.user_id = $${paramCnt}`;
      params.push(usrId);
    }

    query += ` GROUP BY o.order_id, o.order_status, o.delivery_address, o.order_date, o.total_amount, o.user_id, o.order_comment, u.first_name, u.last_name, u.email, pm.payment_status, pm.transaction_number, pm.payment_amount ORDER BY o.order_date DESC`;

    const rslt = await pool.query(query, params);
    // парсим items если это строки и добавляем совместимость полей
    const ords = rslt.rows.map(ord => {
      if (typeof ord.items === 'string') {
        ord.items = JSON.parse(ord.items);
      }
      // конвертируем 'new' в 'pending' для совместимости с frontend
      // добавляем поле status для совместимости с frontend
      ord.status = ord.order_status === 'new' ? 'pending' : ord.order_status;
      ord.shipping_address = ord.delivery_address;
      return ord;
    });
    res.json(ords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// создать новый заказ
router.post('/', async (req, res) => {
  try {
    const { user_id: usrId, items, total_amount: totalAmt, shipping_address: shpAddr } = req.body;

    if (!usrId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'user_id и items обязательны' });
    }

    if (!totalAmt || totalAmt <= 0) {
      return res.status(400).json({ error: 'Некорректная сумма заказа' });
    }

    // начинаем транзакцию
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // создаем заказ
      const ordRslt = await client.query(
        `INSERT INTO orders (user_id, total_amount, order_date, order_status, delivery_address)
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'new', $3) RETURNING *`,
        [usrId, totalAmt, shpAddr || null]
      );

      const ord = ordRslt.rows[0];

      // добавляем товары в заказ
      for (const itm of items) {
        const { product_id: prdctId, quantity: qty, price: prc, discounted_price: dcntPrc } = itm;
        
        if (!prdctId || !qty || !prc) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Некорректные данные товара' });
        }

        const finalPrc = dcntPrc && dcntPrc < prc ? dcntPrc : prc;
        const itemTotal = finalPrc * qty;

        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_order, item_total)
           VALUES ($1, $2, $3, $4, $5)`,
          [ord.order_id, prdctId, qty, finalPrc, itemTotal]
        );
      }

      // очищаем корзину после создания заказа
      await client.query(
        'DELETE FROM cart WHERE user_id = $1',
        [usrId]
      );

      await client.query('COMMIT');

      // получаем полный заказ с товарами
      const fullOrdRslt = await pool.query(
        `SELECT 
          o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'order_item_id', oi.order_item_id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price_at_order,
                'price_at_order', oi.price_at_order,
                'item_total', oi.item_total,
                'product_name', p.name,
                'product_author', p.author
              )
            ) FILTER (WHERE oi.order_item_id IS NOT NULL),
            '[]'::json
          ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.product_id
         WHERE o.order_id = $1
         GROUP BY o.order_id, o.order_status, o.delivery_address, o.order_date, o.total_amount, o.user_id, o.order_comment`,
        [ord.order_id]
      );

      const ordData = fullOrdRslt.rows[0];
      // добавляем поле status для совместимости с frontend
      ordData.status = ordData.order_status;
      ordData.shipping_address = ordData.delivery_address;
      // парсим items если это строка
      if (typeof ordData.items === 'string') {
        ordData.items = JSON.parse(ordData.items);
      }

      res.status(201).json(ordData);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// обновить статус заказа
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status: sts } = req.body;

    if (!sts) {
      return res.status(400).json({ error: 'Статус обязателен' });
    }

    // конвертируем 'pending' из frontend в 'new' для БД
    const statusMap = {
      'pending': 'new',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    const dbStatus = statusMap[sts] || sts;
    const validSts = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validSts.includes(dbStatus)) {
      return res.status(400).json({ error: 'Некорректный статус' });
    }

    const rslt = await pool.query(
      `UPDATE orders 
       SET order_status = $1 
       WHERE order_id = $2 RETURNING *`,
      [dbStatus, id]
    );

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // получаем полный заказ с товарами
    const fullOrdRslt = await pool.query(
      `SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email,
        pm.payment_status,
        pm.transaction_number,
        pm.payment_amount,
        COALESCE(
          json_agg(
            json_build_object(
              'order_item_id', oi.order_item_id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price_at_order,
              'price_at_order', oi.price_at_order,
              'item_total', oi.item_total,
              'product_name', p.name,
              'product_author', p.author
            )
          ) FILTER (WHERE oi.order_item_id IS NOT NULL),
          '[]'::json
        ) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.product_id
       LEFT JOIN LATERAL (
         SELECT payment_status, transaction_number, payment_amount
         FROM payments
         WHERE payments.order_id = o.order_id
         ORDER BY payments.payment_date DESC
         LIMIT 1
       ) pm ON true
       WHERE o.order_id = $1
       GROUP BY o.order_id, o.order_status, o.delivery_address, o.order_date, o.total_amount, o.user_id, o.order_comment, u.first_name, u.last_name, u.email, pm.payment_status, pm.transaction_number, pm.payment_amount`,
      [id]
    );

    const ordData = fullOrdRslt.rows[0];
    // конвертируем 'new' в 'pending' для совместимости с frontend
    // добавляем поле status для совместимости с frontend
    ordData.status = ordData.order_status === 'new' ? 'pending' : ordData.order_status;
    ordData.shipping_address = ordData.delivery_address;
    // парсим items если это строка
    if (typeof ordData.items === 'string') {
      ordData.items = JSON.parse(ordData.items);
    }
    res.json(ordData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// получить заказ по id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rslt = await pool.query(
      `SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email,
        pm.payment_status,
        pm.transaction_number,
        pm.payment_amount,
        COALESCE(
          json_agg(
            json_build_object(
              'order_item_id', oi.order_item_id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price_at_order,
              'price_at_order', oi.price_at_order,
              'item_total', oi.item_total,
              'product_name', p.name,
              'product_author', p.author
            )
          ) FILTER (WHERE oi.order_item_id IS NOT NULL),
          '[]'::json
        ) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.product_id
       LEFT JOIN LATERAL (
         SELECT payment_status, transaction_number, payment_amount
         FROM payments
         WHERE payments.order_id = o.order_id
         ORDER BY payments.payment_date DESC
         LIMIT 1
       ) pm ON true
       WHERE o.order_id = $1
       GROUP BY o.order_id, o.order_status, o.delivery_address, o.order_date, o.total_amount, o.user_id, o.order_comment, u.first_name, u.last_name, u.email, pm.payment_status, pm.transaction_number, pm.payment_amount`,
      [id]
    );

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    const ordData = rslt.rows[0];
    // конвертируем 'new' в 'pending' для совместимости с frontend
    // добавляем поле status для совместимости с frontend
    ordData.status = ordData.order_status === 'new' ? 'pending' : ordData.order_status;
    ordData.shipping_address = ordData.delivery_address;
    // парсим items если это строка
    if (typeof ordData.items === 'string') {
      ordData.items = JSON.parse(ordData.items);
    }
    res.json(ordData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
