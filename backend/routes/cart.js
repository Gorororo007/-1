import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// получить корзину юзера
router.get('/:userId', async (req, res) => {
  try {
    const { userId: usrId } = req.params;
    
    // проверяем, что userId - это число
    const usrIdNum = parseInt(usrId);
    if (isNaN(usrIdNum)) {
      return res.status(400).json({ error: 'Некорректный ID пользователя' });
    }

    const rslt = await pool.query(
      `SELECT 
        c.cart_id,
        c.user_id,
        c.product_id,
        c.quantity,
        c.date_added,
        p.name,
        p.author,
        p.price,
        p.image_url,
        p.status as product_status,
        COALESCE(coupon.discount_type, NULL) as discount_type,
        COALESCE(coupon.discount_value, 0) as discount_value,
        CASE 
          WHEN coupon.discount_type = 'percentage' THEN 
            ROUND(p.price * (1 - coupon.discount_value / 100), 2)
          WHEN coupon.discount_type = 'fixed_amount' THEN 
            GREATEST(p.price - coupon.discount_value, 0)
          ELSE p.price
        END as discounted_price
       FROM cart c
       LEFT JOIN products p ON c.product_id = p.product_id
       LEFT JOIN coupons coupon ON (
         coupon.product_id = p.product_id 
         AND coupon.status = 'active'
         AND CURRENT_DATE BETWEEN coupon.start_date AND coupon.end_date
         AND (coupon.user_id = $1 OR coupon.user_id IS NULL)
       )
       WHERE c.user_id = $1
       ORDER BY c.date_added DESC`,
      [usrIdNum]
    );
    
    // возвращаем пустой массив, если корзина пуста
    res.json(rslt.rows || []);
  } catch (err) {
    console.error('Ошибка при получении корзины:', err);
    res.status(500).json({ error: err.message || 'Ошибка при получении корзины' });
  }
});

// добавить товар в корзину
router.post('/', async (req, res) => {
  try {
    const { user_id: usrId, product_id: prdctId, quantity: qty } = req.body;

    if (!usrId || !prdctId) {
      return res.status(400).json({ error: 'user_id и product_id обязательны' });
    }

    // проверяем, существует ли товар
    const prdctRslt = await pool.query(
      'SELECT * FROM products WHERE product_id = $1',
      [prdctId]
    );

    if (prdctRslt.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // проверяем, есть ли товар уже в корзине
    const existCrtItm = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [usrId, prdctId]
    );

    if (existCrtItm.rows.length > 0) {
      // обновляем количество
      const newQty = (existCrtItm.rows[0].quantity || 0) + (qty || 1);
      const rslt = await pool.query(
        `UPDATE cart 
         SET quantity = $1 
         WHERE user_id = $2 AND product_id = $3 
         RETURNING *`,
        [newQty, usrId, prdctId]
      );
      return res.json(rslt.rows[0]);
    } else {
      // создаем новую запись
      const rslt = await pool.query(
        `INSERT INTO cart (user_id, product_id, quantity)
         VALUES ($1, $2, $3) RETURNING *`,
        [usrId, prdctId, qty || 1]
      );
      return res.status(201).json(rslt.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// обновить количество товара в корзине
router.put('/:cartId', async (req, res) => {
  try {
    const { cartId: crtId } = req.params;
    const { quantity: qty } = req.body;

    if (!qty || qty < 1) {
      return res.status(400).json({ error: 'Количество должно быть больше 0' });
    }

    const rslt = await pool.query(
      `UPDATE cart 
       SET quantity = $1 
       WHERE cart_id = $2 RETURNING *`,
      [qty, crtId]
    );

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Товар в корзине не найден' });
    }
    res.json(rslt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// удалить товар из корзины
router.delete('/:cartId', async (req, res) => {
  try {
    const { cartId: crtId } = req.params;
    const rslt = await pool.query(
      'DELETE FROM cart WHERE cart_id = $1 RETURNING *',
      [crtId]
    );

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Товар в корзине не найден' });
    }
    res.json({ message: 'Товар удален из корзины', cart: rslt.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// очистить всю корзину юзера
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId: usrId } = req.params;
    const rslt = await pool.query(
      'DELETE FROM cart WHERE user_id = $1',
      [usrId]
    );
    res.json({ message: 'Корзина очищена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

