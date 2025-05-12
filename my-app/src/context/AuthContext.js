// my-app/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL for API requests
const API_URL = 'https://pyqdeck-server.onrender.com/api/v1';

// Create the auth context
const AuthContext = createContext();


// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initialAuthLoading, setInitialAuthLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoutCount, setLogoutCount] = useState(0); // NEW: For triggering AppProvider remount
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false); // Track onboarding status

  // Load onboardingCompleted from AsyncStorage (called on mount or logout)
  useEffect(() => {
    const loadOnboardingCompleted = async () => {
      try {
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        setOnboardingCompletedState(!!completed && completed === 'true');
      } catch (e) {
        console.error('[AuthContext] Failed to load onboarding_completed', e);
      }
    };
    loadOnboardingCompleted();
  }, [logoutCount]);

  // Call this to set onboarding as completed (and persist)
  const setOnboardingCompleted = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setOnboardingCompletedState(true);
    } catch (e) {
      console.error('[AuthContext] Failed to save onboardingCompleted', e);
    }
  };

  // Set up axios instance with auth header
  const authAxios = axios.create({
    baseURL: API_URL,
  });

  authAxios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  authAxios.interceptors.response.use(
    (response) => response,
    async (err) => {
      const originalRequest = err.config;
      if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("[AuthContext] Token expired or invalid, attempting refresh.");
        try {
          // === CRITICAL: Token refresh logic is NOT implemented! ===
          // To support long sessions, implement refresh logic here if your backend supports it.
          // Example:
          // const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { currentToken: token });
          // if (data.success && data.token) {
          //   await AsyncStorage.setItem('auth_token', data.token);
          //   setToken(data.token);
          //   authAxios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          //   originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
          //   return authAxios(originalRequest);
          // }
          // If backend does NOT support refresh, user will always be logged out on expiry (suboptimal).
          if (__DEV__) {
            // In development, make a visible warning for testers
            // eslint-disable-next-line no-undef
            if (typeof alert === 'function') alert('Token refresh failed (NOT implemented)! User will be logged out.');
          }
          console.error("[AuthContext] CRITICAL: Token refresh not implemented! User will be logged out.");
          await logout(); // If refresh fails or not implemented, logout
        } catch (refreshError) {
          console.error('[AuthContext] Token refresh error:', refreshError);
          await logout(); // Logout on refresh error
        }
      }
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    const loadToken = async () => {
      setInitialAuthLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          authAxios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Set for subsequent authAxios calls
          await getUserProfile(storedToken); // Pass token for direct use
        }
      } catch (e) {
        console.error('[AuthContext] Failed to load auth token', e);
      } finally {
        setInitialAuthLoading(false);
      }
    };
    loadToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // getUserProfile is memoized with useCallback if it's a dependency

  const getUserProfile = useCallback(async (authTokenToUse) => { // Renamed param
    if (!authTokenToUse) {
      console.log("[AuthContext] getUserProfile called without a token.");
      setCurrentUser(null); // Ensure user is null if no token
      return;
    }
    try {
      // Axios instance already has interceptor, but for direct call with token:
      const config = { headers: { Authorization: `Bearer ${authTokenToUse}` } };
      const response = await axios.get(`${API_URL}/auth/me`, config);

      if (response.data.success) {
        setCurrentUser(response.data.data);
      } else {
        // API reported success:false but didn't throw HTTP error
        console.warn("[AuthContext] getUserProfile API call not successful:", response.data.error);
        await AsyncStorage.removeItem('auth_token');
        setToken(null);
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('[AuthContext] Error fetching user profile:', e.response?.data?.error || e.message);
      if (e.response?.status === 401) { // Specifically handle 401 from /auth/me
        await AsyncStorage.removeItem('auth_token');
        setToken(null);
        setCurrentUser(null);
      }
      // Don't set global error state here as it's an internal profile fetch
    }
  }, []); // Removed authAxios from dep array, it's stable. axios is global.

  const register = async (name, email, password) => {
    setOperationLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name, email, password, role: 'user',
      });
      if (response.data.success && response.data.token) {
        const newToken = response.data.token;
        await AsyncStorage.setItem('auth_token', newToken);
        setToken(newToken);
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await getUserProfile(newToken);
        return true;
      }
      setError(response.data.error || 'Registration failed.');
      return false;
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed. Please try again.');
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const login = async (email, password) => {
    setOperationLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.success && response.data.token) {
        const newToken = response.data.token;
        await AsyncStorage.setItem('auth_token', newToken);
        setToken(newToken);
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await getUserProfile(newToken);
        return true;
      }
      setError(response.data.error || 'Login failed.');
      return false;
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const logout = async () => {
    console.log("[AuthContext] Initiating logout...");
    setOperationLoading(true);
    try {
      // Clear only relevant keys (auth and onboarding)
      const keysToRemove = [
        'auth_token',
        'onboardingCompleted',
        'userPreferences',
        'personalizationCompleted'
      ];
      await AsyncStorage.multiRemove(keysToRemove);
      console.log("[AuthContext] Selected AsyncStorage keys cleared: ", keysToRemove.join(', '));
      setToken(null);
      setCurrentUser(null);
      delete authAxios.defaults.headers.common['Authorization']; // Remove token from axios instance
      setLogoutCount(c => c + 1); // Increment to trigger AppProvider remount
      console.log("[AuthContext] Logout successful, logoutCount incremented.");
    } catch (e) {
      console.error('[AuthContext] Logout error', e);
      setError('Logout failed. Please try again.'); // Optionally set an error
    } finally {
      setOperationLoading(false);
    }
  };

  // updatePassword, forgotPassword, resetPassword, updateProgress, getUserProgress remain the same
  // (Removed for brevity in this specific response, assuming they are correct from previous context)
  const updatePassword = async (currentPassword, newPassword) => {
    setOperationLoading(true);
    setError(null);
    try {
      const response = await authAxios.put('/auth/updatepassword', { currentPassword, newPassword });
      if (response.data.success) {
        if (response.data.token) {
          const newToken = response.data.token;
          await AsyncStorage.setItem('auth_token', newToken);
          setToken(newToken);
          authAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        return true;
      }
      setError(response.data.error || 'Password update failed.');
      return false;
    } catch (e) {
      setError(e.response?.data?.error || 'Password update failed. Please try again.');
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setOperationLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      if (response.data.success) {
        return true;
      }
      setError(response.data.error || 'Forgot password request failed.');
      return false;
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to process password reset. Please try again.');
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    setOperationLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/auth/resetpassword/${resetToken}`, { password: newPassword });
      if (response.data.success) {
        if (response.data.token) {
          const newToken = response.data.token;
          await AsyncStorage.setItem('auth_token', newToken);
          setToken(newToken);
          authAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          await getUserProfile(newToken);
        }
        return true;
      }
      setError(response.data.error || 'Password reset failed.');
      return false;
    } catch (e) {
      setError(e.response?.data?.error || 'Password reset failed. Please try again.');
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const updateProgress = async (questionId, completed) => {
    setOperationLoading(true);
    setError(null);
    try {
      const response = await authAxios.put('/auth/progress', { questionId, completed });
      if (response.data.success) {
        setCurrentUser(response.data.data); // API returns updated user object
        return true;
      }
      setError(response.data.error || 'Failed to update progress.');
      return false;
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update progress. Please try again.');
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const getUserProgress = useCallback(async () => {
    // This function seems like it should be part of AppContext or a user-specific data context,
    // as 'progress' is part of the user object already fetched by getUserProfile.
    // If it's a separate endpoint to get detailed progress, it's fine here.
    // For now, assuming it's as per API.md.
    if (!currentUser) return []; // Or handle as an error/empty state
    setOperationLoading(true);
    setError(null);
    try {
      // The API doc indicates GET /auth/me returns progress. This might be redundant
      // or /auth/progress could be a more detailed endpoint not fully documented.
      // For now, let's assume it's a distinct call.
      const response = await authAxios.get('/auth/progress'); 
      if (response.data.success) {
        return response.data.data; // Assuming this is the progress data structure
      }
      setError(response.data.error || "Failed to fetch progress details.");
      return [];
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to fetch progress. Please try again.');
      return [];
    } finally {
      setOperationLoading(false);
    }
  }, [authAxios, currentUser]);


  const value = {
    currentUser,
    token,
    initialAuthLoading,
    operationLoading, // Replaces 'loading' for clarity
    error,
    logoutCount, // NEW: Expose this
    onboardingCompleted, // Expose onboarding completed state
    setOnboardingCompleted, // Expose method to mark onboarding as done
    register,
    login,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    updateProgress,
    getUserProgress,
    authAxios, // Keep exposing for direct use if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
