import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// получить всех юзеров
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.role_id 
       ORDER BY u.registration_date DESC`
    );
    // убираем пароли из ответа
    const users = result.rows.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// получить юзера по id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const user = result.rows[0];
    delete user.password_hash;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// обновить юзера
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, status, role_id } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           status = COALESCE($5, status),
           role_id = COALESCE($6, role_id)
       WHERE user_id = $7 
       RETURNING user_id, first_name, last_name, email, phone, status, role_id, registration_date`,
      [first_name, last_name, email, phone, status, role_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // получаем название роли
    const roleResult = await pool.query(
      'SELECT role_name FROM roles WHERE role_id = $1',
      [result.rows[0].role_id]
    );

    res.json({
      ...result.rows[0],
      role_name: roleResult.rows[0]?.role_name || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

