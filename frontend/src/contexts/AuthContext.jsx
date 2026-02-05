import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/endpoints';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.auth.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      // For now, using Django's session auth
      // In production, you'd use token auth
      const response = await api.auth.login({ username, password });
      if (response.data) {
        localStorage.setItem('token', 'dummy-token'); // Replace with actual token
        await fetchCurrentUser();
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};