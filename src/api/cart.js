import { apiRequest } from './config.js';

// получить корзину юзера
export async function getCart(userId) {
  return await apiRequest(`/cart/${userId}`);
}

// добавить товар в корзину
export async function addToCart(userId, productId, quantity = 1) {
  return await apiRequest('/cart', {
    method: 'POST',
    body: {
      user_id: userId,
      product_id: productId,
      quantity,
    },
  });
}

// обновить количество товара в корзине
export async function updateCartItem(cartId, quantity) {
  return await apiRequest(`/cart/${cartId}`, {
    method: 'PUT',
    body: { quantity },
  });
}

// удалить товар из корзины
export async function removeFromCart(cartId) {
  return await apiRequest(`/cart/${cartId}`, {
    method: 'DELETE',
  });
}

// очистить корзину юзера
export async function clearCart(userId) {
  return await apiRequest(`/cart/user/${userId}`, {
    method: 'DELETE',
  });
}

