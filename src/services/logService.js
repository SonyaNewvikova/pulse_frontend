import axios from 'axios';
import { getBaseUrl } from './api';

// Класс для управления логами и их отправки в Telegram
class LogService {
  constructor() {
    this.logs = [];
    this.API_URL = getBaseUrl();
    this.botLogEndpoint = `${this.API_URL}/api/frontend-logs/`;
    this.telegramId = localStorage.getItem('currentTelegramId') || null;
    this.logBuffer = [];
    this.bufferTimeout = null;
    this.isBuffering = false;
    this.MAX_BUFFER_SIZE = 10; // Максимальное количество логов в буфере
    this.BUFFER_TIMEOUT = 5000; // Время в мс, через которое буфер будет отправлен автоматически
  }

  // Установить ID пользователя Telegram
  setTelegramId(id) {
    this.telegramId = id;
    localStorage.setItem('currentTelegramId', id);
  }

  // Добавление лога в буфер
  log(message, data = null, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data) : null,
    };
    
    // Сохраняем в локальный буфер
    this.logBuffer.push(logEntry);
    
    // Также выводим в консоль для отладки при разработке
    console[level](message, data || '');
    
    // Если буфер достиг максимального размера или это критическая ошибка, отправляем сразу
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE || level === 'error') {
      this.flushLogs();
    } else if (!this.bufferTimeout) {
      // Иначе запускаем таймер для автоматической отправки
      this.bufferTimeout = setTimeout(() => this.flushLogs(), this.BUFFER_TIMEOUT);
    }
  }

  // Запись информационного сообщения
  info(message, data = null) {
    this.log(message, data, 'info');
  }

  // Запись предупреждения
  warn(message, data = null) {
    this.log(message, data, 'warn');
  }

  // Запись ошибки
  error(message, data = null) {
    this.log(message, data, 'error');
  }

  // Запись данных API-запроса
  logApiRequest(url, method, data = null) {
    this.log(`API Request: ${method.toUpperCase()} ${url}`, data, 'info');
  }

  // Запись данных ответа API
  logApiResponse(url, method, response) {
    this.log(`API Response: ${method.toUpperCase()} ${url}`, response, 'info');
  }

  // Запись ошибки API
  logApiError(url, method, error) {
    const errorData = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
    this.log(`API Error: ${method.toUpperCase()} ${url}`, errorData, 'error');
  }

  // Отправка логов на сервер
  async flushLogs() {
    // Если нет телеграм ID или буфер пустой, не отправляем
    if (!this.telegramId || this.logBuffer.length === 0) {
      this.clearBufferTimeout();
      return;
    }

    // Копируем текущий буфер и очищаем его
    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];
    this.clearBufferTimeout();

    // Избегаем параллельной отправки
    if (this.isBuffering) {
      // Если уже идет отправка, добавляем логи обратно в начало буфера
      this.logBuffer = [...logsToSend, ...this.logBuffer];
      return;
    }

    this.isBuffering = true;

    try {
      // Отправляем логи в бэкенд, который перенаправит их в Telegram
      await axios.post(this.botLogEndpoint, {
        telegram_id: this.telegramId,
        logs: logsToSend
      });
    } catch (error) {
      // В случае ошибки выводим в консоль, но не обрабатываем дальше,
      // чтобы избежать бесконечного цикла логирования ошибок логирования
      console.error('Ошибка отправки логов в Telegram:', error);
      
      // Возвращаем логи в буфер для повторной попытки при следующей отправке
      this.logBuffer = [...logsToSend, ...this.logBuffer];
      
      // Ограничиваем размер буфера, чтобы избежать утечки памяти
      if (this.logBuffer.length > this.MAX_BUFFER_SIZE * 2) {
        this.logBuffer = this.logBuffer.slice(-this.MAX_BUFFER_SIZE);
      }
    } finally {
      this.isBuffering = false;
      
      // Если после отправки в буфере остались логи, запланируем следующую отправку
      if (this.logBuffer.length > 0) {
        this.bufferTimeout = setTimeout(() => this.flushLogs(), this.BUFFER_TIMEOUT);
      }
    }
  }

  // Очистка таймера буфера
  clearBufferTimeout() {
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = null;
    }
  }
}

// Создаем и экспортируем единственный экземпляр сервиса логов
export const logService = new LogService();

// Вспомогательные функции для логирования API вызовов
export const logApiCall = async (url, method, apiCall, params = null) => {
  logService.logApiRequest(url, method, params);
  try {
    const response = await apiCall();
    logService.logApiResponse(url, method, response);
    return response;
  } catch (error) {
    logService.logApiError(url, method, error);
    throw error;
  }
};
