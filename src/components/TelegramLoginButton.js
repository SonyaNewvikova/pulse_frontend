import React, { useEffect } from 'react';
import '../styles/TelegramLoginButton.css';

const TelegramLoginButton = ({ onAuth }) => {
  useEffect(() => {
    // If the app is already running in Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      // We already have user data from WebApp
      onAuth(tg.initDataUnsafe.user);
    }
  }, [onAuth]);

  return (
    <div className="telegram-login">
      <p>Для авторизации откройте приложение через Telegram</p>
      <div className="telegram-button">
        <i className="telegram-icon">✈️</i>
        <span>Войти через Telegram</span>
      </div>
    </div>
  );
};

export default TelegramLoginButton;
