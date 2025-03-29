import axios from 'axios';
import { logService, logApiCall } from './logService';

// API base URL (from environment variable or default)
// Обновлено для автоматического определения localhost или удаленного сервера
export const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  
  // Если URL задан в переменных окружения - используем его
  if (envUrl) return envUrl;
  
  // Проверяем, запущено ли приложение локально
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';
  
  // Для локальной разработки используем localhost, для production - ngrok URL
  return isLocalhost ? 'http://localhost:8000' : 'https://cf9c-89-46-235-158.ngrok-free.app';
};

const API_URL = getBaseUrl();
logService.info("Using API URL:", API_URL);

// Настраиваем axios для работы с CORS
axios.defaults.withCredentials = true;

// Register or authenticate user
export const registerUser = async (telegramId, username) => {
  try {
    // Устанавливаем Telegram ID для сервиса логов
    logService.setTelegramId(telegramId);
    
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/register/`;
    
    return await logApiCall(url, 'post', async () => {
      const response = await axios.post(url, {
        telegram_id: telegramId,
        username: username
      });
      return response.data;
    }, { telegramId, username });
  } catch (error) {
    logService.error('Error registering user:', error);
    throw error;
  }
};

// Send a chat message to AI
export const sendChatMessage = async (telegramId, message) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/chat/`;
    
    return await logApiCall(url, 'post', async () => {
      const response = await axios.post(url, {
        telegram_id: telegramId,
        message: message
      });
      return response.data;
    }, { telegramId, messageLength: message.length });
  } catch (error) {
    logService.error('Error sending message:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Save a message to diary
export const saveMessage = async (messageId) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/save/`;
    
    return await logApiCall(url, 'post', async () => {
      const response = await axios.post(url, {
        message_id: messageId
      });
      return response.data;
    }, { messageId });
  } catch (error) {
    logService.error('Error saving message:', error);
    throw error;
  }
};

// Get saved messages
export const getSavedMessages = async (telegramId) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/saved/`;
    
    return await logApiCall(url, 'get', async () => {
      const response = await axios.get(url, {
        params: { telegram_id: telegramId }
      });
      return response.data;
    }, { telegramId });
  } catch (error) {
    logService.error('Error getting saved messages:', error);
    throw error;
  }
};

/**
 * Get user status
 * @param {string} telegramId 
 * @returns {Promise<Object>}
 */
export const getUserStatus = async (telegramId) => {
  try {
    logService.info("Запрос статуса для ID:", telegramId);
    const url = `${API_URL}/api/status/`;
    
    return await logApiCall(url, 'get', async () => {
      const response = await axios.get(`${url}?telegram_id=${telegramId}`);
      logService.info("Ответ API на getUserStatus:", response.data);
      return response.data;
    }, { telegramId });
  } catch (error) {
    logService.error('Error getting user status:', error);
    const defaultResponse = {
      is_active: false,
      days_left: 0,
      tokens_left: 0,
      limit_reached: true,
      access_status: 'denied'
    };
    logService.warn('Возвращаем значения по умолчанию для статуса:', defaultResponse);
    return defaultResponse;
  }
};

/**
 * Get token limit
 * @param {string} telegramId 
 * @returns {Promise<Object>}
 */
export const getTokenLimit = async (telegramId) => {
  try {
    logService.info("Запрос лимита токенов для ID:", telegramId);
    const url = `${API_URL}/api/limit/`;
    
    return await logApiCall(url, 'get', async () => {
      const response = await axios.get(`${url}?telegram_id=${telegramId}`);
      logService.info("Ответ API на getTokenLimit:", response.data);
      return response.data;
    }, { telegramId });
  } catch (error) {
    logService.error('Error getting token limit:', error);
    const defaultResponse = {
      limit_reached: true,
      tokens_left: 0
    };
    logService.warn('Возвращаем значения по умолчанию для лимита токенов:', defaultResponse);
    return defaultResponse;
  }
};

// Submit feedback
export const submitFeedback = async (telegramId, message, voiceFile = null) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/feedback/`;
    const formData = new FormData();
    formData.append('telegram_id', telegramId);
    
    if (message) {
      formData.append('message', message);
    }
    
    if (voiceFile) {
      formData.append('voice_file', voiceFile);
    }
    
    return await logApiCall(url, 'post', async () => {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    }, { telegramId, hasMessage: !!message, hasVoice: !!voiceFile });
  } catch (error) {
    logService.error('Error submitting feedback:', error);
    throw error;
  }
};
