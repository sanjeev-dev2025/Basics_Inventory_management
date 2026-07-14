import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://127.0.0.1:8000';

// Configure Axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth header helper
  const setAuthHeader = (tokenString) => {
    if (tokenString) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check login state and load profile
  const loadProfile = async (accessToken) => {
    try {
      setAuthHeader(accessToken);
      const response = await axios.get('/profile/');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Login method
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/token/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setToken(access);
      setRefreshToken(refresh);
      
      // Load user profile
      await loadProfile(access);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      const msg = err.response?.data?.detail || "Invalid username or password";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setAuthHeader(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, error, login, logout, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
