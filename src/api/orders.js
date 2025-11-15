import { apiRequest } from './config.js';

// обновить статус заказа (для админа)
export async function updateOrderStatus(id, status) {
  return await apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: { status },
  });
}

// получить заказ по id
export async function getOrderById(id) {
  return await apiRequest(`/orders/${id}`);
}

// создать новый заказ
export async function createOrder(orderData) {
  return await apiRequest('/orders', {
    method: 'POST',
    body: orderData,
  });
}

// получить все заказы (для админа) или заказы пользователя
export async function getOrders(usrId = null) {
  const params = new URLSearchParams();
  if (usrId) params.append('user_id', usrId);
  
  const query = params.toString();
  const endpoint = `/orders${query ? `?${query}` : ''}`;
  return await apiRequest(endpoint);
}

