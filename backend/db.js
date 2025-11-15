import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config();

// единый pool для подключения к бд
export const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
});

pool.on('connect', () => {
  console.log('Подключено к PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Ошибка подключения к PostgreSQL:', err);
});

