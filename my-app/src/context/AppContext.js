// my-app/src/context/AppContext.js
const DEBUG = process.env.NODE_ENV !== 'production'; // Set true to print all backend responses in development only

import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Ensure this path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Import Alert for debugging/errors

// Create the app context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const { authAxios, currentUser } = useAuth();

  // ---- EXISTING FEATURE ONBOARDING ----
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);
  React.useEffect(() => {
    let isMounted = true;
    const loadOnboarding = async () => {
      const stored = await AsyncStorage.getItem('onboardingCompleted');
      if (isMounted) setOnboardingCompletedState(stored === 'true');
    };
    loadOnboarding();
    return () => { isMounted = false; };
  }, []);

  const setOnboardingCompleted = async (value) => {
    setOnboardingCompletedState(!!value);
    await AsyncStorage.setItem('onboardingCompleted', value ? 'true' : 'false');
  };
  // ---- END EXISTING FEATURE ONBOARDING ----

  // ---- NEW PERSONALIZATION ONBOARDING ----
  const [personalizationCompleted, setPersonalizationCompletedState] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    branch: null,
    semester: null,
    college: '', // Optional
    goal: null, // Primary Use Case
    frequency: null,
    preferredContent: null,
    notificationsEnabled: true, // Default
    language: 'English', // Optional, default
  });
  const [initialAppLoading, setInitialAppLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const loadPersonalizationData = async () => {
      if (isMounted) setInitialAppLoading(true); // Start loading
      try {
        const storedPersonalizationCompleted = await AsyncStorage.getItem('personalizationCompleted');
        if (isMounted) setPersonalizationCompletedState(storedPersonalizationCompleted === 'true');

        const storedUserPrefs = await AsyncStorage.getItem('userPreferences');
        if (storedUserPrefs) {
          const parsedPrefs = JSON.parse(storedUserPrefs);
          // Ensure default values are kept if some prefs are missing from storage
          if (isMounted) setUserPreferences(prev => ({ ...prev, ...parsedPrefs }));
        }
      } catch (e) {
        console.error("Failed to load personalization data from storage", e);
        Alert.alert("Loading Error", "Could not load saved preferences.");
      } finally {
        if (isMounted) setInitialAppLoading(false); // Finish loading
      }
    };
    loadPersonalizationData();
    return () => { isMounted = false; };
  }, []);
  // ---- END NEW PERSONALIZATION ONBOARDING ----

  // State for branches, semesters, subjects, and questions
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);

  // General loading and error states for data fetching
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all branches
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get('/branches');
      if (response.data.success) {
        setBranches(response.data.data);
        return response.data.data;
      }
      setBranches([]); // Ensure it's an empty array on failure or no data
      return [];
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch branches. Please try again.');
      setBranches([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Fetch semesters for a specific branch
  const fetchSemesters = useCallback(async (branchId) => {
    if (!branchId) {
        setSemesters([]);
        return [];
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`/branches/${branchId}/semesters`);
      if (response.data.success) {
        setSemesters(response.data.data);
        return response.data.data;
      }
      setSemesters([]);
      return [];
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch semesters. Please try again.');
      setSemesters([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Fetch subjects for a specific semester
  const fetchSubjects = useCallback(async (semesterId) => {
    if (!semesterId) {
        setSubjects([]);
        return [];
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`/semesters/${semesterId}/subjects`);
      if (DEBUG) console.log('fetchSubjects:', response);
      if (response.data.success) {
        setSubjects(response.data.data);
        return response.data.data;
      }
      setSubjects([]);
      return [];
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch subjects. Please try again.');
      setSubjects([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Fetch questions for a specific subject
  const fetchQuestions = useCallback(async (subjectId, filters = {}) => {
    if (!subjectId) {
        setQuestions([]);
        return { questions: [], pagination: {} };
    }
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.chapter) queryParams.append('chapter', filters.chapter);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await authAxios.get(`/subjects/${subjectId}/questions${queryString}`);
      
      if (response.data.success) {
        const { data, count, totalPages, currentPage } = response.data;
        setQuestions(data);
        return {
          questions: data,
          pagination: { count, totalPages, currentPage }
        };
      }
      setQuestions([]);
      return { questions: [], pagination: {} };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch questions. Please try again.');
      setQuestions([]);
      return { questions: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Search questions globally
  const searchQuestions = useCallback(async (searchQuery, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', searchQuery);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await authAxios.get(`/questions?${queryParams.toString()}`);
      
      if (response.data.success) {
        const { data, count, totalPages, currentPage } = response.data;
        // Assuming search results shouldn't overwrite the main `questions` state used by `fetchQuestions`
        return {
          questions: data,
          pagination: { count, totalPages, currentPage }
        };
      }
      return { questions: [], pagination: {} };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search questions. Please try again.');
      return { questions: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Get details for a specific branch
  const getBranchDetails = useCallback(async (branchId) => {
    if (!branchId) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`/branches/${branchId}`);
      return response.data.success ? response.data.data : null;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch branch details.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Get details for a specific semester
  const getSemesterDetails = useCallback(async (semesterId) => {
    if (!semesterId) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`/semesters/${semesterId}`);
      return response.data.success ? response.data.data : null;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch semester details.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Get details for a specific subject
  const getSubjectDetails = useCallback(async (subjectId) => {
    if (!subjectId) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`/subjects/${subjectId}`);
      return response.data.success ? response.data.data : null;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch subject details.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Set current branch and fetch its semesters
  const selectBranch = useCallback(async (branch) => {
    setCurrentBranch(branch);
    setCurrentSemester(null);
    setSemesters([]); // Clear previous semesters
    setCurrentSubject(null);
    setSubjects([]); // Clear previous subjects
    setQuestions([]); // Clear previous questions
    if (branch && branch._id) {
      return await fetchSemesters(branch._id);
    }
    return [];
  }, [fetchSemesters]);

  // Set current semester and fetch its subjects
  const selectSemester = useCallback(async (semester) => {
    setCurrentSemester(semester);
    setCurrentSubject(null);
    setSubjects([]); // Clear previous subjects
    setQuestions([]); // Clear previous questions
    if (semester && semester._id) {
      return await fetchSubjects(semester._id);
    }
    return [];
  }, [fetchSubjects]);

  // Set current subject and fetch its questions
  const selectSubject = useCallback(async (subject, filters = {}) => {
    setCurrentSubject(subject);
    setQuestions([]); // Clear previous questions
    if (subject && subject._id) {
      return await fetchQuestions(subject._id, filters);
    }
    return { questions: [], pagination: {} };
  }, [fetchQuestions]);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setCurrentBranch(null);
    setCurrentSemester(null);
    setCurrentSubject(null);
    setSemesters([]);
    setSubjects([]);
    setQuestions([]);
  }, []);

  // ---- NEW PERSONALIZATION METHODS ----
  const updatePreference = useCallback((key, value) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const savePersonalizationPreferences = useCallback(async (finalNotificationsEnabledValue) => {
    setLoading(true); // Use the general loading state for this operation too
    setError(null);
    
    // Log current state for debugging
    if (DEBUG) {
      console.log("[AppContext] Attempting to save preferences...");
      console.log("[AppContext] CurrentUser for ID:", currentUser?._id);
      console.log("[AppContext] UserPreferences state before save (notifications might be stale here):", userPreferences);
      console.log("[AppContext] finalNotificationsEnabledValue passed to save:", finalNotificationsEnabledValue);
    }

    try {
      const finalPrefsToStoreInStorage = {
        userId: currentUser?._id || 'unknown_user_id_in_prefs',
        // Store full branch and its id
        branch: userPreferences.branch ? { ...userPreferences.branch } : null,
        branchId: userPreferences.branch && userPreferences.branch._id ? userPreferences.branch._id : null,
        // Store full semester and its id
        semester: userPreferences.semester ? { ...userPreferences.semester } : null,
        semesterId: userPreferences.semester && userPreferences.semester._id ? userPreferences.semester._id : null,
        college: userPreferences.college || null,
        goal: userPreferences.goal || null,
        frequency: userPreferences.frequency || null,
        preferredContent: userPreferences.preferredContent || null,
        notifications: finalNotificationsEnabledValue,
        language: userPreferences.language || 'English',
      };
      if (DEBUG) {
        console.log("[AppContext] Object being stored in AsyncStorage:", JSON.stringify(finalPrefsToStoreInStorage, null, 2));
      }

      await AsyncStorage.setItem('userPreferences', JSON.stringify(finalPrefsToStoreInStorage));
      await AsyncStorage.setItem('personalizationCompleted', 'true');
      
      // Update the AppContext state to reflect exactly what was saved
      // This also ensures that if userPreferences had complex objects for branch/semester,
      // the context state is now aligned with the simplified stored version.
      setUserPreferences(finalPrefsToStoreInStorage); 
      setPersonalizationCompletedState(true);
      
      if (DEBUG) {
        console.log("[AppContext] Preferences saved successfully. personalizationCompleted set to true.");
      }
      return true; // Indicate success
    } catch (e) {
      console.error("[AppContext] Failed to save user preferences:", e);
      const errorMessage = e.message || "An unknown error occurred during save.";
      setError("Failed to save preferences. Error: " + errorMessage);
      Alert.alert("Save Error", "Could not save preferences: " + errorMessage);
      
      // Attempt to revert completion state on failure if it was prematurely set
      setPersonalizationCompletedState(false); 
      try {
        await AsyncStorage.setItem('personalizationCompleted', 'false'); 
      } catch (revertError) {
        console.error("[AppContext] Failed to revert personalizationCompleted flag in storage", revertError);
      }
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  }, [currentUser, userPreferences]); // Dependencies: if currentUser or userPreferences (the object reference) change, recreate.


  // Value object that will be provided to consumers of this context
  const value = {
    // Existing Feature Onboarding
    onboardingCompleted,
    setOnboardingCompleted,

    initialAppLoading, // For personalization flags and userPrefs loading

    // Data
    branches,
    semesters,
    subjects,
    questions,
    currentBranch,
    currentSemester,
    currentSubject,
    loading, // General loading for data fetching operations (branches, sems, etc.)
    error,   // General error for data fetching operations

    // Methods
    fetchBranches,
    fetchSemesters,
    fetchSubjects,
    fetchQuestions,
    searchQuestions,
    getBranchDetails,
    getSemesterDetails,
    getSubjectDetails,
    selectBranch,
    selectSemester,
    selectSubject,
    clearSelections,

    // New Personalization Onboarding
    personalizationCompleted,
    userPreferences,
    updatePreference,
    savePersonalizationPreferences,
    authAxios, // Expose authAxios if other parts of app might need it through AppContext
    currentUser, // Expose currentUser if needed by AppContext consumers
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
