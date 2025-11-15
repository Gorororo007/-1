import { apiRequest } from './config.js';

// удалить товар (для админа)
export async function deleteProduct(id) {
  return await apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
}

// обновить товар (для админа)
export async function updateProduct(id, productData) {
  return await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: productData,
  });
}

// получить товар по id
export async function getProductById(id, userId = null) {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  
  const query = params.toString();
  const endpoint = `/products/${id}${query ? `?${query}` : ''}`;
  return await apiRequest(endpoint);
}

// создать новый товар (для админа)
export async function createProduct(productData) {
  return await apiRequest('/products', {
    method: 'POST',
    body: productData,
  });
}

// получить все товары
export async function getProducts(categoryId = null, userId = null) {
  const params = new URLSearchParams();
  if (categoryId) params.append('category_id', categoryId);
  if (userId) params.append('user_id', userId);
  
  const query = params.toString();
  const endpoint = `/products${query ? `?${query}` : ''}`;
  return await apiRequest(endpoint);
}

