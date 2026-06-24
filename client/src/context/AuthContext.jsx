import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { apiError } from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // initial hydrate
  const navigate = useNavigate();

  // Hydrate the user on first load if a token exists.
  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        localStorage.removeItem('taskflow_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('taskflow_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    localStorage.setItem('taskflow_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, apiError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
