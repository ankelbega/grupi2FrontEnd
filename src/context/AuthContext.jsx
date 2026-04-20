import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      api
        .get('/api/me')
        .then((res) => {
          setUser(res.data.data);
          setToken(storedToken);
          setIsAuthenticated(true);
        })
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData, tokenString) => {
    localStorage.setItem('auth_token', tokenString);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    setToken(tokenString);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post('/api/logout');
    } catch {
      // best effort
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  const isAdmin = ctx.user?.PERD_TIPI === 'admin';
  return { ...ctx, isAdmin };
}
