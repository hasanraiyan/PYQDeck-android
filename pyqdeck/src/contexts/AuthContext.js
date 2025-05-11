// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiServices'; 
import { USER_TOKEN_KEY, RECENT_SEARCHES_KEY, ONBOARDING_COMPLETED_KEY } from '../constants/appConstants';
import { playHaptic } from '../utils/haptics'; // We'll create this file
import { Alert } from 'react-native';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For initial token load

  useEffect(() => {
    const bootstrapAsync = async () => {
      let storedUserToken = null;
      try {
        const storedUserTokenString = await AsyncStorage.getItem(USER_TOKEN_KEY);
        if (storedUserTokenString) {
          storedUserToken = JSON.parse(storedUserTokenString);
          if (storedUserToken && (storedUserToken.isGuest || storedUserToken.apiToken)) {
             // If it's a real user, try to refresh their profile to ensure token validity
            if (storedUserToken.apiToken && !storedUserToken.isGuest) {
              try {
                // Temporarily set token for api.getMe to use it via AsyncStorage mechanism in apiService
                // This is a bit of a workaround if apiService strictly reads from AsyncStorage for every call.
                // A better approach might be for apiService to accept a token directly or for AuthContext to hold it.
                // For now, we assume api.getMe() will correctly pick up the token if it's set in AsyncStorage.
                // await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(storedUserToken)); // Re-set to ensure getApiToken() picks it up

                const meResponse = await api.getMe();
                if (meResponse.success && meResponse.data) {
                  storedUserToken = { ...storedUserToken, profile: meResponse.data };
                } else {
                  console.warn("Failed to refresh /auth/me on load, token might be invalid.");
                  await AsyncStorage.removeItem(USER_TOKEN_KEY);
                  storedUserToken = null; // Invalidate token
                }
              } catch (e) {
                console.warn("Error refreshing /auth/me on load:", e.message);
                if (e.message.includes("401") || e.message.toLowerCase().includes("unauthorized")) {
                    await AsyncStorage.removeItem(USER_TOKEN_KEY);
                    storedUserToken = null;
                }
                // If other error, we might still use the cached profile for a bit if available
              }
            }
          } else { // Invalid structure in storage
            await AsyncStorage.removeItem(USER_TOKEN_KEY);
            storedUserToken = null;
          }
        }
      } catch (e) {
        console.warn('AuthContext: Restoring token failed', e);
        await AsyncStorage.removeItem(USER_TOKEN_KEY); // Clear potentially corrupted token
        storedUserToken = null;
      }
      setUserToken(storedUserToken);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContextValue = useMemo(() => ({
    userToken,
    isLoading, // Expose isLoading for App.js to manage splash screen
    signIn: async (credentials) => {
      try {
        const response = await api.login(credentials.email, credentials.password);
        if (response.success && response.token) {
          // Fetch profile immediately after login
          // The token needs to be available for api.getMe.
          // Temporarily store minimal token for getMe to pick up.
          const tempToken = { apiToken: response.token };
          await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(tempToken));

          const profileRes = await api.getMe();
          if (profileRes.success && profileRes.data) {
            const newUserToken = {
              apiToken: response.token,
              profile: profileRes.data,
              isGuest: false,
              bookmarkedPyqIds: [], // Initialize fresh for a new login
              recentlyViewedSubjectIds: [],
              pyqUserData: {},
              preferences: profileRes.data.preferences || {}, // Load preferences from profile if available
            };
            setUserToken(newUserToken);
            await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(newUserToken));
            playHaptic('success');
            return newUserToken;
          } else {
            await AsyncStorage.removeItem(USER_TOKEN_KEY); // Clean up if profile fetch fails
            throw new Error(profileRes.error || "Login successful, but failed to fetch profile.");
          }
        } else {
          throw new Error(response.error || "Login failed. Please check your credentials.");
        }
      } catch (error) {
        console.error("Sign In Error:", error);
        playHaptic('error');
        throw error; // Re-throw for the UI to catch
      }
    },
    signUp: async (userData) => {
      try {
        const response = await api.register(userData);
        if (response.success && response.token) {
          const tempToken = { apiToken: response.token };
          await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(tempToken));

          const profileRes = await api.getMe(); // Fetch profile after signup
          if (profileRes.success && profileRes.data) {
            const newUserToken = {
              apiToken: response.token,
              profile: profileRes.data,
              isGuest: false,
              bookmarkedPyqIds: [],
              recentlyViewedSubjectIds: [],
              pyqUserData: {},
              preferences: profileRes.data.preferences || {},
            };
            setUserToken(newUserToken);
            await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(newUserToken));
            playHaptic('success');
            return newUserToken;
          } else {
            await AsyncStorage.removeItem(USER_TOKEN_KEY);
             throw new Error(profileRes.error || "Signup successful, but failed to fetch profile.");
          }
        } else {
          throw new Error(response.error || "Signup failed. Please try again.");
        }
      } catch (error) {
        console.error("Sign Up Error:", error);
        playHaptic('error');
        throw error;
      }
    },
    signOut: async () => {
      setUserToken(null);
      await AsyncStorage.removeItem(USER_TOKEN_KEY);
      // Optionally clear other app-specific non-sensitive data if desired on logout
      // await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      playHaptic('medium');
      // Note: Onboarding status is usually kept.
    },
    continueAsGuest: async () => {
      const guestData = {
        isGuest: true,
        profile: { name: 'Guest Explorer' }, // Minimal profile for guest
        bookmarkedPyqIds: [],
        recentlyViewedSubjectIds: [],
        pyqUserData: {},
        preferences: {},
      };
      setUserToken(guestData);
      await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(guestData));
      playHaptic();
    },
    updateUserPreferences: async (newPreferences) => {
      if (userToken) {
        const updatedToken = {
          ...userToken,
          preferences: { ...userToken.preferences, ...newPreferences },
        };
        setUserToken(updatedToken);
        await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(updatedToken));
        // Optionally sync with backend if preferences are stored there
        // if (!userToken.isGuest && userToken.apiToken) {
        //   try { await api.updateMyPreferences(newPreferences); } catch (e) { console.warn("Failed to sync preferences to server", e); }
        // }
      }
    },
    toggleBookmark: async (pyqMongoId) => {
      if (!userToken) return;
      const currentBookmarks = Array.isArray(userToken.bookmarkedPyqIds) ? userToken.bookmarkedPyqIds : [];
      let newBookmarks;
      if (currentBookmarks.includes(pyqMongoId)) {
        newBookmarks = currentBookmarks.filter(id => id !== pyqMongoId);
      } else {
        newBookmarks = [...currentBookmarks, pyqMongoId];
      }
      const updatedToken = { ...userToken, bookmarkedPyqIds: newBookmarks };
      setUserToken(updatedToken);
      await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(updatedToken));
      // No API call here, bookmarks are client-side in this model
    },
    isBookmarked: (pyqMongoId) => {
      return Array.isArray(userToken?.bookmarkedPyqIds) && userToken.bookmarkedPyqIds.includes(pyqMongoId);
    },
    addRecentlyViewedSubject: async (subjectData) => { // subjectData: {_id, name, color}
      if (!userToken || !subjectData || !subjectData._id) return;
      let currentRecents = Array.isArray(userToken.recentlyViewedSubjectIds) ? userToken.recentlyViewedSubjectIds : [];
      // Remove if already exists to move it to the front
      currentRecents = currentRecents.filter(sub => (sub._id || sub.id) !== subjectData._id);
      const newRecents = [subjectData, ...currentRecents].slice(0, 5); // Keep max 5
      const updatedToken = { ...userToken, recentlyViewedSubjectIds: newRecents };
      setUserToken(updatedToken);
      await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(updatedToken));
    },
    getPyqUserData: (pyqQuestionCodeId) => {
      const baseData = userToken?.pyqUserData?.[pyqQuestionCodeId] || { status: 'not_started', notes: '' };
      // Reconcile with API's completedQuestions if user is logged in
      if (userToken && !userToken.isGuest && userToken.profile?.completedQuestions?.includes(pyqQuestionCodeId)) {
        if (baseData.status === 'not_started') {
          return { ...baseData, status: 'practiced' }; // API says completed, local says not_started -> set to practiced
        }
      }
      return baseData;
    },
    updatePyqStatus: async (pyqQuestionCodeId, newStatus_3state) => {
      if (!userToken) return;

      // Optimistic UI update
      const currentPyqData = userToken.pyqUserData || {};
      const updatedPyqItemData = { ...(currentPyqData[pyqQuestionCodeId] || { notes: '' }), status: newStatus_3state };
      const newPyqUserData = { ...currentPyqData, [pyqQuestionCodeId]: updatedPyqItemData };
      
      let newCompletedQuestionsList = userToken.profile?.completedQuestions ? [...userToken.profile.completedQuestions] : [];
      const isCompletedForApi = (newStatus_3state === 'practiced' || newStatus_3state === 'mastered');

      if (isCompletedForApi) {
        if (!newCompletedQuestionsList.includes(pyqQuestionCodeId)) {
          newCompletedQuestionsList.push(pyqQuestionCodeId);
        }
      } else {
        newCompletedQuestionsList = newCompletedQuestionsList.filter(id => id !== pyqQuestionCodeId);
      }
      
      const optimisticallyUpdatedToken = {
        ...userToken,
        pyqUserData: newPyqUserData,
        profile: userToken.profile ? {
          ...userToken.profile,
          completedQuestions: newCompletedQuestionsList,
          progress: newCompletedQuestionsList.length, // Assuming progress is just the count
        } : null,
      };
      setUserToken(optimisticallyUpdatedToken);
      await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(optimisticallyUpdatedToken));

      // API Call if not guest
      if (!userToken.isGuest && userToken.apiToken) {
        try {
          await api.updateProgress(pyqQuestionCodeId, isCompletedForApi);
          // If API call is successful, the optimistic update is confirmed.
          // We might re-fetch /me or trust the optimistic update. For now, trust.
        } catch (error) {
          console.error("Failed to update PYQ progress to API:", error);
          Alert.alert("Sync Error", "Could not update progress with the server. Your changes are saved locally.");
          // Note: The data is already saved locally optimistically.
          // Consider reverting or showing a clearer sync error state if critical.
        }
      }
    },
    updatePyqNotes: async (pyqQuestionCodeId, notes) => {
      if (!userToken) return;
      const currentPyqData = userToken.pyqUserData || {};
      const updatedPyqItemData = { ...(currentPyqData[pyqQuestionCodeId] || { status: 'not_started' }), notes: notes };
      const newPyqUserData = { ...currentPyqData, [pyqQuestionCodeId]: updatedPyqItemData };
      const updatedToken = { ...userToken, pyqUserData: newPyqUserData };
      setUserToken(updatedToken);
      await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(updatedToken));
      // Notes are client-side only in this model for now.
    },
    refreshAuthMe: async () => {
      if (userToken && userToken.apiToken && !userToken.isGuest) {
        try {
          const meResponse = await api.getMe();
          if (meResponse.success && meResponse.data) {
            const newProfile = meResponse.data;
            // Reconcile pyqUserData with newProfile.completedQuestions
            const newPyqUserData = { ...(userToken.pyqUserData || {}) };
            if (newProfile.completedQuestions) {
              Object.keys(newPyqUserData).forEach(qCodeId => {
                const localData = newPyqUserData[qCodeId];
                if (newProfile.completedQuestions.includes(qCodeId)) { // API says completed
                  if (localData.status === 'not_started') {
                    newPyqUserData[qCodeId].status = 'practiced'; // Update local if API is ahead
                  }
                } else { // API says NOT completed
                  // If local was 'practiced' or 'mastered', it might be an unsynced change.
                  // For a hard refresh, you might revert to 'not_started'.
                  // Or, trust local if it's more advanced. Current: trust local.
                  // To be more aggressive:
                  // if (localData.status === 'practiced' || localData.status === 'mastered') {
                  //   newPyqUserData[qCodeId].status = 'not_started';
                  // }
                }
              });
            }

            const updatedToken = {
              ...userToken,
              profile: newProfile,
              pyqUserData: newPyqUserData,
              preferences: newProfile.preferences || userToken.preferences || {}, // Prioritize server preferences
            };
            setUserToken(updatedToken);
            await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(updatedToken));
            playHaptic('success');
            return true;
          } else {
            if (meResponse.error && (meResponse.error.includes("401") || meResponse.error.toLowerCase().includes("unauthorized")) ) {
              throw new Error("401 Unauthorized - Token may be invalid.");
            }
            console.warn("refreshAuthMe: Failed to get /me, server error:", meResponse.error);
          }
        } catch (e) {
          console.error("Refresh /auth/me error:", e.message);
          if (e.message.includes("401")) { // If token is invalid, sign out
            setUserToken(null);
            await AsyncStorage.removeItem(USER_TOKEN_KEY);
            playHaptic('error');
          }
        }
      }
      return false;
    },
    clearPracticeDataAndApi: async () => {
      if (!userToken || userToken.isGuest) {
        Alert.alert("Info", "Not logged in or no practice data for guests.");
        return;
      }
      
      const questionsToClearOnApi = userToken.profile?.completedQuestions ? [...userToken.profile.completedQuestions] : [];
      
      // Clear local data first for immediate UI feedback
      const clearedPyqUserData = {}; // Reset all statuses and notes
      const updatedToken = {
        ...userToken,
        pyqUserData: clearedPyqUserData,
        profile: userToken.profile ? {
          ...userToken.profile,
          completedQuestions: [],
          progress: 0,
        } : null,
      };
      setUserToken(updatedToken);
      await AsyncStorage.setItem(USER_TOKEN_KEY, JSON.stringify(updatedToken));
      Alert.alert("Local Data Cleared", "All PYQ statuses and notes have been reset locally. Attempting to sync with server...");
      playHaptic('success');

      // Then attempt to clear on server
      if (questionsToClearOnApi.length > 0) {
        try {
          const promises = questionsToClearOnApi.map(qCodeId =>
            api.updateProgress(qCodeId, false).catch(e => {
              console.warn(`Failed to uncomplete ${qCodeId} on API:`, e.message);
              // Optionally, collect failed IDs to inform the user
            })
          );
          await Promise.all(promises);
          Alert.alert("Server Sync Complete", "Practice data cleared on the server as well.");
        } catch (apiError) {
          console.error("Error clearing progress on API during batch operation", apiError);
          Alert.alert("Server Sync Issue", "Could not clear all practice data on the server. Your local data is cleared.");
        }
      } else {
         Alert.alert("No Server Data", "No completed questions were found on the server to clear.");
      }
    },
    clearSensitiveData: async () => { // Full app reset
      setUserToken(null);
      // setShowOnboarding(true); // This state would be managed in App.js
      await AsyncStorage.multiRemove([USER_TOKEN_KEY, ONBOARDING_COMPLETED_KEY, RECENT_SEARCHES_KEY]);
      // Add any other AsyncStorage keys that should be cleared during a full reset
      console.log("Sensitive data cleared. App will reset.");
      playHaptic('success');
      // App.js will need to handle the state change to show onboarding or login
    },
  }), [userToken, isLoading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};