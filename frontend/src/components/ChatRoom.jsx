import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../useWebSocket';
import { api } from '../api';
import UserList from './UserList';
import MessageBubble from './MessageBubble';

export default function ChatRoom({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const { connected, subscribe, publish } = useWebSocket(user);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load message history
  useEffect(() => {
    api.getMessages().then(setMessages).catch(console.error);
    api.getUsers().then(setAllUsers).catch(console.error);
  }, []);

  // Subscribe to WebSocket topics
  useEffect(() => {
    if (!connected) return;

    // Send join event once
    if (!hasJoinedRef.current) {
      publish('/app/chat.join', {
        senderId: user.userId,
        senderName: user.username,
        type: 'JOIN',
      });
      hasJoinedRef.current = true;
    }

    const sub1 = subscribe('/topic/messages', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    const sub2 = subscribe('/topic/online-users', (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    const sub3 = subscribe('/topic/typing', (msg) => {
      if (msg.senderName !== user.username) {
        setTypingUsers((prev) => {
          if (!prev.includes(msg.senderName)) return [...prev, msg.senderName];
          return prev;
        });
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== msg.senderName));
        }, 3000);
      }
    });

    // Private messages
    const sub4 = subscribe(`/queue/private-${user.userId}`, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      [sub1, sub2, sub3, sub4].forEach((s) => s?.unsubscribe?.());
    };
  }, [connected, subscribe, publish, user]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connected) {
        publish('/app/chat.leave', {
          senderId: user.userId,
          senderName: user.username,
          type: 'LEAVE',
        });
      }
    };
  }, [connected, publish, user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;

    const message = {
      senderId: user.userId,
      senderName: user.username,
      content: input.trim(),
      type: 'TEXT',
      isPrivate: false,
    };

    publish('/app/chat', message);
    setInput('');
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    publish('/app/chat.typing', {
      senderId: user.userId,
      senderName: user.username,
      type: 'TYPING',
    });
    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  };

  const handleLogout = () => {
    if (connected) {
      publish('/app/chat.leave', {
        senderId: user.userId,
        senderName: user.username,
        type: 'LEAVE',
      });
    }
    onLogout();
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-sm">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            ChatWave
          </h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div className="sidebar-user-info">
          <div className="user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user.username}</span>
            <span className={`user-status ${connected ? 'online' : 'offline'}`}>
              {connected ? 'Online' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Online Users ({onlineUsers.length})</h3>
          <UserList users={onlineUsers} allUsers={allUsers} currentUser={user.username} />
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn" id="logout-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      {!sidebarOpen && (
        <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Main Chat Area */}
      <main className="chat-main">
        <div className="chat-header">
          <div className="chat-header-info">
            <h2># General Chat</h2>
            <span className="chat-subtitle">
              {connected ? `${onlineUsers.length} online` : 'Reconnecting...'}
            </span>
          </div>
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot" />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="messages-container" id="messages-container">
          {messages.length === 0 && (
            <div className="empty-chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3>No messages yet</h3>
              <p>Be the first to send a message!</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id || idx}
              message={msg}
              isOwn={msg.senderName === user.username}
              isSystem={msg.type === 'JOIN' || msg.type === 'LEAVE'}
            />
          ))}

          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="message-form" id="message-form">
          <div className="input-wrapper">
            <input
              type="text"
              id="message-input"
              placeholder={connected ? 'Type a message...' : 'Connecting...'}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              disabled={!connected}
              autoComplete="off"
            />
            <button
              type="submit"
              className="send-btn"
              id="send-button"
              disabled={!connected || !input.trim()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
