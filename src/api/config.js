import { getErrorMessage } from '../utils/errorHandler.js';

// базовый url api
export const API_URL = 'http://localhost:3001/api';

// функция для выполнения запросов
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    // проверяем, что ответ можно преобразовать в json
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      const errorMsg = getErrorMessage(new Error(text || 'Ошибка запроса'));
      throw new Error(errorMsg);
    }

    if (!response.ok) {
      // если ошибка уже на русском от backend, используем её
      const errorText = data.error || `Ошибка ${response.status}: ${response.statusText}`;
      const errorMsg = getErrorMessage(new Error(errorText));
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    // конвертируем ошибку в понятное русское сообщение
    const errorMsg = getErrorMessage(error);
    throw new Error(errorMsg);
  }
}

