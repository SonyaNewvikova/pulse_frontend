import React from 'react';
import '../styles/StatusBar.css';

const StatusBar = ({ daysLeft, tokensLeft, limitReached, accessStatus }) => {
  // Определяем статус доступа на основе полученных данных
  const hasAccess = accessStatus === 'active';
  
  return (
    <div className="status-bar">
      <div className={`status-item days ${hasAccess ? 'active' : 'inactive'}`}>
        <span className="status-label">Доступ:</span>
        {hasAccess ? (
          <span className="status-value">{daysLeft} дней</span>
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
