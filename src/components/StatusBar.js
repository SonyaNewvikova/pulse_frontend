import React, { useState, useEffect } from 'react';
import '../styles/StatusBar.css';

const StatusBar = ({ daysLeft, tokensLeft, limitReached, accessStatus }) => {
  // Состояние для хранения локальных данных
  const [localStatus, setLocalStatus] = useState({
    daysLeft: daysLeft,
    accessStatus: accessStatus
  });
  
  // При изменении props или при монтировании компонента
  useEffect(() => {
    console.log("StatusBar получил props:", { daysLeft, tokensLeft, limitReached, accessStatus });
    
    // Если данные пришли с API, обновляем состояние
    if (daysLeft > 0 && accessStatus === 'active') {
      setLocalStatus({
        daysLeft: daysLeft,
        accessStatus: 'active'
      });
      
      // Сохраняем данные в localStorage только для текущего пользователя
      const userKey = `user_${localStorage.getItem('currentTelegramId')}`;
      localStorage.setItem(`${userKey}_accessStatus`, 'active');
      localStorage.setItem(`${userKey}_daysLeft`, daysLeft.toString());
    } else {
      setLocalStatus({
        daysLeft: daysLeft,
        accessStatus: accessStatus
      });
    }
  }, [daysLeft, accessStatus, tokensLeft, limitReached]);
  
  // Определяем, есть ли доступ на основе реальных данных
  const hasAccess = localStatus.daysLeft > 0 && localStatus.accessStatus === 'active';
  
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
