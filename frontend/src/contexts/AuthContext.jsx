import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

/**
 * Authentication Context
 * Provides global authentication state and actions
 */

const AuthContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = authService.getToken();
    const storedUser = authService.getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Login user
   */
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login(username, password);
      setToken(data.access_token);
      // Fetch user data (we need to make an additional call or store minimal user info)
      // For now, we'll store minimal user info
      const userInfo = { username }; // You can enhance this by fetching full user profile
      setUser(userInfo);
      authService.storeAuth(data.access_token, userInfo);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (email, username, password) => {
    try {
      setError(null);
      setLoading(true);
      await authService.register(email, username, password);
      // Auto-login after registration
      return await login(username, password);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
