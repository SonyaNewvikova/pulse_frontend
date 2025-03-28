import React from 'react';
import '../styles/StatusBar.css';

const StatusBar = ({ daysLeft, tokensLeft, limitReached }) => {
  return (
    <div className="status-bar">
      <div className={`status-item days ${daysLeft > 0 ? 'active' : 'inactive'}`}>
        <span className="status-label">Доступ:</span>
        {daysLeft > 0 ? (
          <span className="status-value">{daysLeft} дней</span>
        ) : (
          <span className="status-value">Закончился</span>
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
