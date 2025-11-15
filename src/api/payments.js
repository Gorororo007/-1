import { apiRequest } from './config.js';

// обновить статус платежа
export async function updatePaymentStatus(id, status, transactionNumber = null) {
  return await apiRequest(`/payments/${id}`, {
    method: 'PUT',
    body: { payment_status: status, transaction_number: transactionNumber },
  });
}

// получить платеж по id
export async function getPaymentById(id) {
  return await apiRequest(`/payments/${id}`);
}

// создать новый платеж
export async function createPayment(paymentData) {
  return await apiRequest('/payments', {
    method: 'POST',
    body: paymentData,
  });
}

// получить все платежи
export async function getPayments(orderId = null) {
  const params = new URLSearchParams();
  if (orderId) params.append('order_id', orderId);
  
  const query = params.toString();
  const endpoint = `/payments${query ? `?${query}` : ''}`;
  return await apiRequest(endpoint);
}

