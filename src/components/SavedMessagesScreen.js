import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getSavedMessages } from '../services/api';
import '../styles/SavedMessagesScreen.css';

const SavedMessagesScreen = ({ user }) => {
  const [savedMessages, setSavedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    // Применяем темную тему ко всей странице
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchSavedMessages = async () => {
      if (!user || !user.telegram_id) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }
      
      try {
        console.log("Запрос сохраненных сообщений для ID:", user.telegram_id);
        const data = await getSavedMessages(user.telegram_id);
        console.log("Получены сохраненные сообщения:", data);
        
        // Проверяем, что data - это массив
        if (Array.isArray(data)) {
          setSavedMessages(data);
        } else {
          setSavedMessages([]);
          setError('Нет сохраненных сообщений');
        }
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке сохраненных сообщений:", err);
        setError('Не удалось загрузить сохранённые ответы');
        setLoading(false);
      }
    };

    fetchSavedMessages();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const toggleTheme = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
  };

  return (
    <div className="saved-messages-screen">
      <div className="saved-header">
        <h2>Сохраненные ответы</h2>
        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={darkMode ? "Включить светлую тему" : "Включить темную тему"}
          >
            {darkMode ? '🌞' : '🌜'}
          </button>
          <button onClick={() => navigate('/')}>
            Вернуться к чату
          </button>
        </div>
      </div>

      <div className="saved-messages-container">
        {loading ? (
          <div className="loading">Загрузка сохранённых ответов...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : savedMessages.length === 0 ? (
          <div className="no-saved-messages">
            <p>У вас пока нет сохранённых ответов.</p>
            <button onClick={() => navigate('/')}>Вернуться к чату</button>
          </div>
        ) : (
          <div className="saved-messages-list">
            {savedMessages.map((msg) => (
              <div key={msg.id} className="saved-message-card">
                <div className="saved-message-date">
                  {formatDate(msg.created_at)}
                </div>
                <div className="saved-message-content markdown-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedMessagesScreen;
