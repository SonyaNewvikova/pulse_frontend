import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import ChatScreen from './components/ChatScreen';
import SavedMessagesScreen from './components/SavedMessagesScreen';
import TelegramLoginButton from './components/TelegramLoginButton';
import StatusBar from './components/StatusBar';
import { registerUser, getUserStatus, getTokenLimit } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    daysLeft: 0,
    tokensLeft: 0,
    limitReached: false,
    accessStatus: 'denied'
  });

  useEffect(() => {
    // Check if Telegram WebApp is available
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Initialize Telegram WebApp
      tg.expand();
      tg.ready();

      // Check if user is already registered
      const initData = tg.initData;
      const telegramId = tg.initDataUnsafe?.user?.id;
      const username = tg.initDataUnsafe?.user?.username || '';

      // Проверяем, не сменился ли пользователь
      const currentId = localStorage.getItem('currentTelegramId');
      if (currentId && currentId !== telegramId.toString()) {
        // Сбрасываем локальное хранилище при смене пользователя
        localStorage.removeItem('userAccessStatus');
        localStorage.removeItem('userDaysLeft');
        // Очищаем все ключи, связанные с предыдущим пользователем
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`user_${currentId}`)) {
            localStorage.removeItem(key);
          }
        });
        console.log("Сменился пользователь, локальное хранилище очищено");
      }

      if (telegramId) {
        // Сохраняем идентификатор текущего пользователя
        localStorage.setItem('currentTelegramId', telegramId);
        registerUser(telegramId, username)
          .then(response => {
            setUser(response.user);
            // After registration, get user status
            return getUserStatus(telegramId);
          })
          .then(statusData => {
            console.log("Получен статус:", statusData);
            
            // Получаем информацию о лимите токенов
            return getTokenLimit(telegramId).then(limitData => {
              console.log("Получен лимит токенов:", limitData);
              
              // Принудительно устанавливаем статус активным, если есть дни доступа
              const hasAccessDays = statusData.days_left > 0;
              const isActive = statusData.is_active === true;
              const accessStatus = hasAccessDays && isActive ? 'active' : statusData.access_status || 'denied';
              
              // Комбинируем данные о статусе и токенах
              setStatus({
                daysLeft: statusData.days_left || 0,
                tokensLeft: limitData.tokens_left || 0,
                limitReached: limitData.limit_reached || false,
                accessStatus: accessStatus
              });
              
              setLoading(false);
            });
          })
          .catch(error => {
            console.error('Error during initialization:', error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      // Not running inside Telegram WebApp
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  // If no user, show login
  if (!user) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>ИИ, который не даст сдаться</h1>
          <p>Пожалуйста, авторизуйтесь через Telegram</p>
          <TelegramLoginButton onAuth={userData => {
            registerUser(userData.id, userData.username)
              .then(response => setUser(response.user));
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Router>
        <StatusBar 
          daysLeft={status.daysLeft} 
          tokensLeft={status.tokensLeft} 
          limitReached={status.limitReached} 
          accessStatus={status.accessStatus}
        />
        <Routes>
          <Route path="/" element={<ChatScreen user={user} />} />
          <Route path="/saved" element={<SavedMessagesScreen user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
