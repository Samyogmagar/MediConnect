import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
  const getPayload = (response) => {
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    return response || null;
  };

  const getStoredToken = () => {
    const stored = localStorage.getItem('token');
    if (!stored || stored === 'undefined' || stored === 'null') {
      return null;
    }
    return stored;
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          const payload = getPayload(response);
          setUser(payload?.user || null);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const setAuthSession = useCallback((userData, authToken) => {
    if (!authToken || !userData) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      return;
    }

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const payload = getPayload(response);
    const userData = payload?.user;
    const authToken = payload?.token;

    setAuthSession(userData, authToken);

    return response;
  }, [setAuthSession]);

  const register = useCallback(async (data) => {
    const response = await authService.register(data);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      const payload = getPayload(response);
      const updatedUser = payload?.user || null;
      setUser(updatedUser);
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem('user');
      }
      return updatedUser;
    } catch {
      return null;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
    setAuthSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
