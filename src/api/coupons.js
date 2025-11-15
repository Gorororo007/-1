import { apiRequest } from './config.js';

// удалить купон (для админа)
export async function deleteCoupon(id) {
  return await apiRequest(`/coupons/${id}`, {
    method: 'DELETE',
  });
}

// получить купон по коду
export async function getCouponByCode(code) {
  return await apiRequest(`/coupons/code/${code}`);
}

// создать новый купон (для админа)
export async function createCoupon(couponData) {
  return await apiRequest('/coupons', {
    method: 'POST',
    body: couponData,
  });
}

// обновить купон (для админа)
export async function updateCoupon(id, couponData) {
  return await apiRequest(`/coupons/${id}`, {
    method: 'PUT',
    body: couponData,
  });
}

// получить купон по id
export async function getCouponById(id) {
  return await apiRequest(`/coupons/${id}`);
}

// получить все купоны
export async function getCoupons(userId = null, productId = null, status = null) {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (productId) params.append('product_id', productId);
  if (status) params.append('status', status);
  
  const query = params.toString();
  const endpoint = `/coupons${query ? `?${query}` : ''}`;
  return await apiRequest(endpoint);
}

