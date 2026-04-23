const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const user = JSON.parse(localStorage.getItem('chat_user') || 'null');
  const headers = {
    'Content-Type': 'application/json',
    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch (err) {
    throw new Error('Cannot connect to server. Please ensure the backend is running.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: (page = 0, size = 50) => request(`/messages?page=${page}&size=${size}`),
  getPrivateMessages: (userId, page = 0, size = 50) =>
    request(`/messages/private/${userId}?page=${page}&size=${size}`),
  getUsers: () => request('/users'),
  getOnlineUsers: () => request('/users/online'),
  getMe: () => request('/users/me'),
};
