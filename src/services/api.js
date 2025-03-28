import axios from 'axios';

// API base URL (from environment variable or default)
// Обновлено для автоматического определения localhost или удаленного сервера
const getBaseUrl = () => {
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
console.log("Using API URL:", API_URL);

// Настраиваем axios для работы с CORS
axios.defaults.withCredentials = true;

// Register or authenticate user
export const registerUser = async (telegramId, username) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/register/`;
    const response = await axios.post(url, {
      telegram_id: telegramId,
      username: username
    });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Send a chat message to AI
export const sendChatMessage = async (telegramId, message) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/chat/`;
    const response = await axios.post(url, {
      telegram_id: telegramId,
      message: message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
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
    const response = await axios.post(url, {
      message_id: messageId
    });
    return response.data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Get saved messages
export const getSavedMessages = async (telegramId) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/saved/`;
    const response = await axios.get(url, {
      params: { telegram_id: telegramId }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting saved messages:', error);
    throw error;
  }
};

// Get user status (access days and token limits)
export const getUserStatus = async (telegramId) => {
  try {
    // Убираем возможность двойного слеша, обеспечивая правильный формат URL
    const url = `${API_URL.replace(/\/+$/, '')}/api/status/`;
    const response = await axios.get(url, {
      params: { telegram_id: telegramId }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user status:', error);
    throw error;
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
    
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};
