import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, saveMessage } from '../services/api';
import '../styles/ChatScreen.css';

const ChatScreen = ({ user }) => {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
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
    // Scroll to bottom when messages change
    scrollToBottom();
    // Сохраняем сообщения в localStorage
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Автоматическое изменение высоты текстового поля
  useEffect(() => {
    if (textareaRef.current) {
      // Полный сброс высоты до минимальной
      textareaRef.current.style.height = "44px";
      
      if (input.trim() === '') {
        // Если поле пустое, оставляем минимальную высоту
        return;
      }
      
      // Затем устанавливаем высоту на основе содержимого
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [input]); // Перерасчет при каждом изменении input
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleTheme = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
  };

  const clearChat = () => {
    setMessages([]);
    setShowClearConfirm(false);
    localStorage.removeItem('chatMessages');
  };
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    setInput('');
    setSending(true);
    setError(null);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    try {
      // Send message to AI
      const response = await sendChatMessage(user.telegram_id, input);
      
      // Check for errors
      if (response.error) {
        setError(response.message || 'Произошла ошибка. Попробуйте позже.');
      } else {
        // Add AI response to chat
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.message,
          messageId: response.message_id,
          saved: false
        }]);
      }
    } catch (err) {
      setError('Не удалось отправить сообщение. Проверьте подключение к интернету.');
    } finally {
      setSending(false);
    }
  };
  
  const handleSaveMessage = async (messageId, index) => {
    try {
      await saveMessage(messageId);
      
      // Update message state to reflect it's saved
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[index] = {
          ...newMessages[index],
          saved: true
        };
        return newMessages;
      });
    } catch (err) {
      setError('Не удалось сохранить сообщение.');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className={`chat-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Кнопка для мобильного меню */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Открыть меню"
      >
        ☰
      </button>
      
      <div className={`chat-sidebar ${sidebarVisible ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={() => setShowClearConfirm(true)}>
            <span>Новый чат</span>
          </button>
        </div>
        
        {showClearConfirm && (
          <div className="clear-chat-confirm">
            <p>Вы действительно хотите очистить чат? ИИ не будет помнить предыдущий контекст.</p>
            <div className="confirm-buttons">
              <button onClick={() => setShowClearConfirm(false)}>Отмена</button>
              <button onClick={clearChat}>Очистить</button>
            </div>
          </div>
        )}
        
        <div className="sidebar-footer">
          <button 
            className="saved-messages-btn"
            onClick={() => navigate('/saved')}
          >
            <span>Сохранённые ответы</span>
          </button>
        </div>
      </div>
      
      <div className="chat-main">
        <div className="chat-header">
          <div className="header-left">
            <h2>Пульс</h2>
          </div>
          {/* Убираем статус из заголовка, так как он есть в верхней панели */}
          <div className="header-actions">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={darkMode ? "Включить светлую тему" : "Включить темную тему"}
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>Привет! Я ИИ, который поможет тебе не сдаться</h3>
              <p>Я готов выслушать тебя и поддержать. Напиши, что у тебя на душе, или о какой проблеме ты хочешь поговорить.</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? 
                  <div className="user-avatar">Я</div> : 
                  <div className="assistant-avatar">ИИ</div>
                }
              </div>
              
              <div className="message-bubble">
                {msg.role === 'user' ? (
                  <div className="message-content">{msg.content}</div>
                ) : (
                  <div className="message-content markdown-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    
                    {!msg.saved ? (
                      <button 
                        className="save-message-btn"
                        onClick={() => handleSaveMessage(msg.messageId, index)}
                      >
                        Сохранить ответ
                      </button>
                    ) : (
                      <span className="saved-indicator">✓ Сохранено</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {sending && (
            <div className="message assistant">
              <div className="message-avatar">
                <div className="assistant-avatar">ИИ</div>
              </div>
              <div className="message-bubble">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-container">
          <div className="chat-input">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напиши сообщение..."
              disabled={sending}
              rows="1"
            />
            <button 
              className="send-button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              title="Отправить сообщение"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L12 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 13L12 20L19 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="input-footer">
            ИИ может допускать ошибки. Рекомендуем проверять важную информацию.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
