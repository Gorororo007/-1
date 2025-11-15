// функция для конвертации технических ошибок в понятные русские сообщения
export function getErrorMessage(error) {
  if (!error) {
    return 'Произошла неизвестная ошибка. Попробуйте обновить страницу.';
  }

  const errorMsg = error.message || error.toString() || '';
  const lowerMsg = errorMsg.toLowerCase();

  // ошибки сети и подключения
  if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('networkerror') || lowerMsg.includes('network error')) {
    return 'Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте снова.';
  }

  if (lowerMsg.includes('fetch failed') || lowerMsg.includes('network')) {
    return 'Проблема с подключением к серверу. Проверьте подключение к интернету.';
  }

  // ошибки сервера
  if (lowerMsg.includes('500') || lowerMsg.includes('internal server error')) {
    return 'Ошибка на сервере. Попробуйте позже или обратитесь к администратору.';
  }

  if (lowerMsg.includes('503') || lowerMsg.includes('service unavailable')) {
    return 'Сервер временно недоступен. Попробуйте через несколько минут.';
  }

  // ошибки авторизации
  if (lowerMsg.includes('401') || lowerMsg.includes('unauthorized')) {
    return 'Необходимо войти в систему. Пожалуйста, войдите заново.';
  }

  if (lowerMsg.includes('403') || lowerMsg.includes('forbidden')) {
    return 'У вас нет прав для выполнения этого действия.';
  }

  // ошибки не найдено
  if (lowerMsg.includes('404') || lowerMsg.includes('not found')) {
    return 'Запрашиваемая информация не найдена. Возможно, она была удалена.';
  }

  // ошибки валидации
  if (lowerMsg.includes('400') || lowerMsg.includes('bad request')) {
    if (lowerMsg.includes('обязательны') || lowerMsg.includes('обязательное поле')) {
      return errorMsg; // уже на русском
    }
    return 'Неверно заполнены данные. Проверьте правильность введенной информации.';
  }

  // ошибки базы данных
  if (lowerMsg.includes('duplicate') || lowerMsg.includes('unique constraint')) {
    if (lowerMsg.includes('email')) {
      return 'Пользователь с таким email уже существует. Используйте другой email.';
    }
    if (lowerMsg.includes('coupon_code') || lowerMsg.includes('купон')) {
      return 'Купон с таким кодом уже существует. Используйте другой код.';
    }
    if (lowerMsg.includes('category_name') || lowerMsg.includes('категори')) {
      return 'Категория с таким названием уже существует. Используйте другое название.';
    }
    return 'Такая запись уже существует в базе данных. Измените данные и попробуйте снова.';
  }

  if (lowerMsg.includes('foreign key') || lowerMsg.includes('constraint')) {
    return 'Невозможно выполнить действие: связанные данные не найдены или используются в других записях.';
  }

  if (lowerMsg.includes('not null') || lowerMsg.includes('null value')) {
    return 'Не заполнены обязательные поля. Заполните все обязательные поля и попробуйте снова.';
  }

  // таймауты
  if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
    return 'Превышено время ожидания ответа. Попробуйте снова или проверьте подключение к интернету.';
  }

  // если ошибка уже на русском, возвращаем её как есть
  if (/[а-яё]/i.test(errorMsg)) {
    return errorMsg;
  }

  // общие технические ошибки
  if (lowerMsg.includes('cannot') || lowerMsg.includes('unable')) {
    return 'Невозможно выполнить операцию. Проверьте правильность введенных данных.';
  }

  if (lowerMsg.includes('invalid') || lowerMsg.includes('некорректн')) {
    return 'Введены некорректные данные. Проверьте правильность заполнения полей.';
  }

  // если ничего не подошло, возвращаем общее сообщение
  return 'Произошла ошибка при выполнении операции. Попробуйте снова или обратитесь к администратору.';
}

