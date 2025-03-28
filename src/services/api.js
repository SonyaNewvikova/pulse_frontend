import axios from 'axios';

// Base URL for API requests - change in production
// Используем переменную окружения или локальный адрес по умолчанию
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Настраиваем axios для работы с CORS
axios.defaults.withCredentials = true;

// Register or authenticate user
export const registerUser = async (telegramId, username) => {
  try {
    const response = await axios.post(`${API_URL}/api/register/`, {
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
    const response = await axios.post(`${API_URL}/api/chat/`, {
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
    const response = await axios.post(`${API_URL}/api/save/`, {
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
    const response = await axios.get(`${API_URL}/api/saved/`, {
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
    const response = await axios.get(`${API_URL}/api/status/`, {
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
    const formData = new FormData();
    formData.append('telegram_id', telegramId);
    
    if (message) {
      formData.append('message', message);
    }
    
    if (voiceFile) {
      formData.append('voice_file', voiceFile);
    }
    
    const response = await axios.post(`${API_URL}/api/feedback/`, formData, {
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
