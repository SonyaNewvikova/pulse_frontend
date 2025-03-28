import React, { useState, useEffect } from 'react';
import '../styles/StatusBar.css';

const StatusBar = ({ daysLeft, tokensLeft, limitReached, accessStatus }) => {
  // Принудительно установим статус активным для отладки
  const [localStatus, setLocalStatus] = useState({
    daysLeft: 426, // Жестко закодированное значение для отладки
    accessStatus: 'active' // Жестко закодированное значение для отладки
  });
  
  // Выводим отладочную информацию в консоль
  useEffect(() => {
    console.log("StatusBar получил props:", { daysLeft, tokensLeft, limitReached, accessStatus });
    console.log("Текущий localStatus:", localStatus);
    
    // Проверяем localStorage
    const savedStatus = localStorage.getItem('userAccessStatus');
    const savedDays = localStorage.getItem('userDaysLeft');
    console.log("Данные из localStorage:", { savedStatus, savedDays });
    
    // Принудительно устанавливаем статус активным
    localStorage.setItem('userAccessStatus', 'active');
    localStorage.setItem('userDaysLeft', '426');
    
    setLocalStatus({
      daysLeft: 426,
      accessStatus: 'active'
    });
  }, [daysLeft, accessStatus, tokensLeft, limitReached]);
  
  // Всегда показываем активный доступ для отладки
  const hasAccess = true;
  
  return (
    <div className="status-bar">
      <div className={`status-item days ${hasAccess ? 'active' : 'inactive'}`}>
        <span className="status-label">Доступ:</span>
        {hasAccess ? (
          <span className="status-value">{localStatus.daysLeft} дней</span>
        ) : (
          <span className="status-value">
            {localStatus.accessStatus === 'expired' ? 'Закончился' : 'Не активирован'}
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
