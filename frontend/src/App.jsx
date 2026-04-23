import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, register, chat

  useEffect(() => {
    const stored = localStorage.getItem('chat_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.token) {
          setUser(parsed);
          setView('chat');
        }
      } catch (e) {
        localStorage.removeItem('chat_user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('chat_user', JSON.stringify(userData));
    setUser(userData);
    setView('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_user');
    setUser(null);
    setView('login');
  };

  return (
    <div className="app">
      {view === 'login' && (
        <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />
      )}
      {view === 'register' && (
        <Register onRegister={handleLogin} onSwitchToLogin={() => setView('login')} />
      )}
      {view === 'chat' && user && (
        <ChatRoom user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
