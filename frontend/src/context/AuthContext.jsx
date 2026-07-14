import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginService, getProfile } from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await getProfile();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to fetch profile on load", error);
          // Token might be expired, interceptor will try to refresh it
          // If refresh fails, it will redirect to login and clear tokens
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginService(credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      const profileResponse = await getProfile();
      setUser(profileResponse.data);
      setIsAuthenticated(true);
      toast.success("Login successful!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
