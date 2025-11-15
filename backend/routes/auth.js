import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const router = express.Router();

// регистрация нового юзера
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    // валидация
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Некорректный email' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    }

    // проверяем, есть ли уже такой юзер
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    // хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // получаем роль "user" по умолчанию
    const roleQuery = await pool.query(
      'SELECT role_id, role_name FROM roles WHERE role_name = $1',
      ['user']
    );
    const roleId = roleQuery.rows[0]?.role_id || null;
    const roleName = roleQuery.rows[0]?.role_name || 'user';

    // создаем юзера
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, first_name, last_name, email, phone, registration_date, status, role_id`,
      [first_name, last_name, email, phone || null, passwordHash, roleId]
    );

    const user = {
      ...result.rows[0],
      role_name: roleName,
      role_id: roleId
    };

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// вход юзера
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // валидация
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // ищем юзера
    const result = await pool.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.role_id 
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    // проверяем статус
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Аккаунт заблокирован' });
    }

    // проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // убираем пароль из ответа
    delete user.password_hash;

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role_name: user.role_name,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

