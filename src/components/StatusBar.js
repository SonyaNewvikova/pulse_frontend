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
    // Проверяем localStorage
    const savedStatus = localStorage.getItem('userAccessStatus');
    const savedDays = localStorage.getItem('userDaysLeft');
    
    // Если есть сохраненные данные, используем их
    if (savedStatus === 'active' && savedDays) {
      setLocalStatus({
        daysLeft: parseInt(savedDays),
        accessStatus: 'active'
      });
    } 
    // Иначе используем props
    else if (daysLeft > 0 && accessStatus === 'active') {
      setLocalStatus({
        daysLeft: daysLeft,
        accessStatus: 'active'
      });
      // Сохраняем данные
      localStorage.setItem('userAccessStatus', 'active');
      localStorage.setItem('userDaysLeft', daysLeft.toString());
    }
    // Если данные пришли с API, обновляем состояние
    else if (daysLeft !== localStatus.daysLeft || accessStatus !== localStatus.accessStatus) {
      setLocalStatus({
        daysLeft: daysLeft,
        accessStatus: accessStatus
      });
    }
  }, [daysLeft, accessStatus]);
  
  // Определяем, есть ли доступ
  const hasAccess = localStatus.accessStatus === 'active' || localStatus.daysLeft > 0;
  
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
