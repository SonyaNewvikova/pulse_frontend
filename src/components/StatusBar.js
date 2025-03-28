import React, { useState, useEffect } from 'react';
import '../styles/StatusBar.css';

const StatusBar = ({ daysLeft, tokensLeft, limitReached, accessStatus }) => {
  // Принудительно устанавливаем статус доступа активным, если есть дни доступа
  // Это временный фикс, пока API не вернет корректные данные
  const [localDaysLeft, setLocalDaysLeft] = useState(daysLeft);
  
  // Если у пользователя отображается статус бота с днями, используем эти данные
  useEffect(() => {
    const savedDaysLeft = localStorage.getItem('userDaysLeft');
    if (savedDaysLeft && parseInt(savedDaysLeft) > 0) {
      setLocalDaysLeft(parseInt(savedDaysLeft));
    } else if (daysLeft > 0) {
      localStorage.setItem('userDaysLeft', daysLeft.toString());
      setLocalDaysLeft(daysLeft);
    }
  }, [daysLeft]);
  
  // Если у пользователя есть дни доступа > 0, это значит доступ активен
  const hasAccess = localDaysLeft > 0;
  
  return (
    <div className="status-bar">
      <div className={`status-item days ${hasAccess ? 'active' : 'inactive'}`}>
        <span className="status-label">Доступ:</span>
        {hasAccess ? (
          <span className="status-value">{localDaysLeft} дней</span>
        ) : (
          <span className="status-value">
            {accessStatus === 'expired' ? 'Закончился' : 'Не активирован'}
          </span>
        )}
      </div>
      
      <div className={`status-item tokens ${!limitReached ? 'active' : 'inactive'}`}>
        <span className="status-label">Лимит:</span>
        {!limitReached ? (
          <span className="status-value">≈{tokensLeft} токенов</span>
        ) : (
          <span className="status-value">Исчерпан</span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
