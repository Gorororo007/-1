import { apiRequest } from './config.js';

// удалить категорию (для админа)
export async function deleteCategory(id) {
  return await apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// создать новую категорию (для админа)
export async function createCategory(categoryData) {
  return await apiRequest('/categories', {
    method: 'POST',
    body: categoryData,
  });
}

// обновить категорию (для админа)
export async function updateCategory(id, categoryData) {
  return await apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: categoryData,
  });
}

// получить категорию по id
export async function getCategoryById(id) {
  return await apiRequest(`/categories/${id}`);
}

// получить все категории
export async function getCategories() {
  return await apiRequest('/categories');
}

