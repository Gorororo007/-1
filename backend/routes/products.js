import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// удалить товар
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rslt = await pool.query(
      'DELETE FROM products WHERE product_id = $1 RETURNING *',
      [id]
    );

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json({ message: 'Товар удален', product: rslt.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// создать новый товар
router.post('/', async (req, res) => {
  try {
    const { name: nm, description: desc, author, price: prc, image_url: imgUrl, stock_quantity: stockQty, status: sts, category_id: ctgrId } = req.body;
    
    if (!nm || !prc) {
      return res.status(400).json({ error: 'Название и цена обязательны' });
    }

    const rslt = await pool.query(
      `INSERT INTO products (name, description, author, price, image_url, stock_quantity, status, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        nm,
        desc || null,
        author || null,
        prc,
        imgUrl || null,
        stockQty || 0,
        sts || 'available',
        ctgrId || null
      ]
    );
    res.status(201).json(rslt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// получить товар по id (со скидкой)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: usrId } = req.query;
    const rslt = await pool.query(
      `SELECT 
        p.*, 
        c.category_name,
        COALESCE(coupon.discount_type, NULL) as discount_type,
        COALESCE(coupon.discount_value, 0) as discount_value,
        CASE 
          WHEN coupon.discount_type = 'percentage' THEN 
            ROUND(p.price * (1 - coupon.discount_value / 100), 2)
          WHEN coupon.discount_type = 'fixed_amount' THEN 
            GREATEST(p.price - coupon.discount_value, 0)
          ELSE p.price
        END as discounted_price
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.category_id 
       LEFT JOIN coupons coupon ON (
         coupon.product_id = p.product_id 
         AND coupon.status = 'active'
         AND CURRENT_DATE BETWEEN coupon.start_date AND coupon.end_date
         AND (coupon.user_id = $2 OR coupon.user_id IS NULL)
       )
       WHERE p.product_id = $1`,
      [id, usrId || null]
    );
    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(rslt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// обновить товар
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name: nm, description: desc, author, price: prc, image_url: imgUrl, stock_quantity: stockQty, status: sts, category_id: ctgrId } = req.body;

    const rslt = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           author = COALESCE($3, author),
           price = COALESCE($4, price),
           image_url = COALESCE($5, image_url),
           stock_quantity = COALESCE($6, stock_quantity),
           status = COALESCE($7, status),
           category_id = COALESCE($8, category_id)
       WHERE product_id = $9 RETURNING *`,
      [nm, desc, author, prc, imgUrl, stockQty, sts, ctgrId, id]
    );

    if (rslt.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(rslt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// получить все товары (с фильтром по категориям и скидками)
router.get('/', async (req, res) => {
  try {
    const { category_id: ctgrId, status: sts, user_id: usrId } = req.query;
    let query = `
      SELECT 
        p.*, 
        c.category_name,
        COALESCE(coupon.discount_type, NULL) as discount_type,
        COALESCE(coupon.discount_value, 0) as discount_value,
        CASE 
          WHEN coupon.discount_type = 'percentage' THEN 
            ROUND(p.price * (1 - coupon.discount_value / 100), 2)
          WHEN coupon.discount_type = 'fixed_amount' THEN 
            GREATEST(p.price - coupon.discount_value, 0)
          ELSE p.price
        END as discounted_price
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      LEFT JOIN coupons coupon ON (
        coupon.product_id = p.product_id 
        AND coupon.status = 'active'
        AND CURRENT_DATE BETWEEN coupon.start_date AND coupon.end_date
        AND (coupon.user_id = $1 OR coupon.user_id IS NULL)
      )
      WHERE 1=1
    `;
    const params = [usrId || null];
    let paramCnt = 1;

    // поддержка множественного выбора категорий
    if (ctgrId) {
      const ctgrIds = Array.isArray(ctgrId) ? ctgrId : [ctgrId];
      if (ctgrIds.length > 0) {
        paramCnt++;
        const placeholders = ctgrIds.map((_, i) => `$${paramCnt + i}`).join(',');
        query += ` AND p.category_id IN (${placeholders})`;
        params.push(...ctgrIds);
        paramCnt += ctgrIds.length - 1;
      }
    }

    if (sts) {
      paramCnt++;
      query += ` AND p.status = $${paramCnt}`;
      params.push(sts);
    }

    query += ' ORDER BY p.date_added DESC';

    const rslt = await pool.query(query, params);
    res.json(rslt.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

