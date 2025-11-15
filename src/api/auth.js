import { apiRequest } from './config.js';

// регистрация
export async function register(userData) {
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

// вход
export async function login(email, password) {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

