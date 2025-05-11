import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL for API requests
const API_URL = 'https://pyqdeck-server.onrender.com/api/v1';

// Create the auth context
const AuthContext = createContext();

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios instance with auth header
  const authAxios = axios.create({
    baseURL: API_URL,
  });

  // Add token to requests if available
  authAxios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle token expiration
  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Attempt to refresh token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            token
          });
          
          if (response.data.success) {
            const newToken = response.data.token;
            await AsyncStorage.setItem('auth_token', newToken);
            setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return authAxios(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logout user
          await logout();
        }
      }
      return Promise.reject(error);
    }
  );

  // Load token from storage on initial render
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch user profile with the token
          await getUserProfile(storedToken);
        }
      } catch (error) {
        console.error('Failed to load auth token', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();

    // Add event listener for token changes
    const tokenListener = async () => {
      const newToken = await AsyncStorage.getItem('auth_token');
      if (newToken !== token) {
        setToken(newToken);
        if (newToken) {
          await getUserProfile(newToken);
        } else {
          setCurrentUser(null);
        }
      }
    };

    // Set up interval to check for token changes
    const intervalId = setInterval(tokenListener, 5000);
    return () => clearInterval(intervalId);
  }, [token]);

  // Get user profile with token
  const getUserProfile = async (authToken) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };

      const response = await axios.get(`${API_URL}/auth/me`, config);
      if (response.data.success) {
        setCurrentUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile', error);
      // If token is invalid, clear it
      await AsyncStorage.removeItem('auth_token');
      setToken(null);
      setCurrentUser(null);
    }
  };

  // Register a new user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role: 'user', // Default role
      });

      if (response.data.success) {
        const newToken = response.data.token;
        await AsyncStorage.setItem('auth_token', newToken);
        setToken(newToken);
        await getUserProfile(newToken);
        return true;
      }
      return false;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Registration failed. Please try again.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const newToken = response.data.token;
        await AsyncStorage.setItem('auth_token', newToken);
        setToken(newToken);
        await getUserProfile(newToken);
        return true;
      }
      return false;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Login failed. Please check your credentials.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    try {
      // Wipe ALL data from AsyncStorage on logout for full data erase
      await AsyncStorage.clear();
      setToken(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setLoading(false);
    }
  };

  // Persist user data to storage
  const persistUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to persist user data', error);
    }
  };

  // Load persisted user data from storage
  const loadPersistedUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load persisted user data', error);
    }
  };

  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.put('/auth/updatepassword', {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        // Update token if a new one is returned
        if (response.data.token) {
          const newToken = response.data.token;
          await AsyncStorage.setItem('auth_token', newToken);
          setToken(newToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Password update failed. Please try again.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/forgotpassword`, {
        email,
      });

      if (response.data.success) {
        return true;
      }
      return false;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Failed to process password reset. Please try again.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (resetToken, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_URL}/auth/resetpassword/${resetToken}`,
        { password: newPassword }
      );

      if (response.data.success) {
        if (response.data.token) {
          const newToken = response.data.token;
          await AsyncStorage.setItem('auth_token', newToken);
          setToken(newToken);
          await getUserProfile(newToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Password reset failed. Please try again.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user progress
  const updateProgress = async (questionId, completed) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.put('/auth/progress', {
        questionId,
        completed,
      });

      if (response.data.success) {
        // Update user data with new progress
        setCurrentUser(response.data.data);
        return true;
      }
      return false;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Failed to update progress. Please try again.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get user's question progress
  const getUserProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get('/auth/progress');
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Failed to fetch progress. Please try again.'
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Value object that will be provided to consumers of this context
  const value = {
    currentUser,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    updateProgress,
    getUserProgress,
    authAxios,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
