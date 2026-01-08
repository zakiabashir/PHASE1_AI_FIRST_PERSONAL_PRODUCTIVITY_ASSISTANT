import api from './api';

/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} User data
 */
export const register = async (email, username, password) => {
  const response = await api.post('/api/auth/register', {
    email,
    username,
    password,
  });
  return response.data;
};

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} Token data
 */
export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await api.post('/api/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

/**
 * Logout user - Clear local storage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get stored token
 * @returns {string|null} JWT token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get stored user data
 * @returns {object|null} User data
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Store token and user data
 * @param {string} token - JWT token
 * @param {object} user - User data
 */
export const storeAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
