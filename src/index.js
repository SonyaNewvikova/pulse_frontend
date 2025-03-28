import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Инициализация Telegram Mini App
const initTelegramApp = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    // Расширяем окно приложения
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.enableClosingConfirmation();
    
    // Определяем, является ли платформа десктопной
    const isDesktop = ["windows", "macos", "linux"].includes(window.Telegram.WebApp.platform);
    
    // Можем добавить класс к body в зависимости от платформы
    if (isDesktop) {
      document.body.classList.add('desktop-platform');
      
      // Устанавливаем ширину для десктопа
      const mainElement = document.documentElement;
      mainElement.style.setProperty('--app-width', '800px');
      mainElement.style.setProperty('--content-width', '100%');
      
      // Проверяем через 500мс, чтобы убедиться, что стили применились
      setTimeout(() => {
        window.Telegram.WebApp.expand();
      }, 500);
    } else {
      document.body.classList.add('mobile-platform');
      document.documentElement.style.setProperty('--app-width', '100%');
    }
    
    console.log('Telegram WebApp initialized with platform:', window.Telegram.WebApp.platform);
  } else {
    console.log('Telegram WebApp not available, running in standalone mode');
    document.body.classList.add('standalone');
    document.documentElement.style.setProperty('--app-width', '800px');
  }
};

// Инициализируем Telegram Mini App
initTelegramApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
