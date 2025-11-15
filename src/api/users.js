import { apiRequest } from './config.js';

// получить всех юзеров
export async function getUsers() {
  return await apiRequest('/users');
}

// получить юзера по id
export async function getUserById(id) {
  return await apiRequest(`/users/${id}`);
}

// обновить юзера
export async function updateUser(id, userData) {
  return await apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: userData,
  });
}

