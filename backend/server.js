import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

// подключаем роуты
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import cartRouter from './routes/cart.js';
import couponsRouter from './routes/coupons.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';

// загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// тестовый эндпоинт для проверки подключения к бд
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Подключение к БД работает!', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// подключаем все роуты
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

// обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Эндпоинт не найден' });
});

// обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступно по адресу: http://localhost:${PORT}/api`);
});

