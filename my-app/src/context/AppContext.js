import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Create the app context
const AppContext = createContext();

import AsyncStorage from '@react-native-async-storage/async-storage';

// Provider component that makes app data available to any child component that calls useApp()
export const AppProvider = ({ children }) => {
  const { authAxios } = useAuth();

  // Onboarding state — in context + persistent
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);
  const [personalizationCompleted, setPersonalizationCompletedState] = useState(false);

  React.useEffect(() => {
    const loadOnboarding = async () => {
      const stored = await AsyncStorage.getItem('onboardingCompleted');
      setOnboardingCompletedState(stored === 'true');
      const personalization = await AsyncStorage.getItem('personalizationCompleted');
      setPersonalizationCompletedState(personalization === 'true');
    };
    loadOnboarding();
  }, []);

  const setOnboardingCompleted = async (value) => {
    setOnboardingCompletedState(!!value);
    await AsyncStorage.setItem('onboardingCompleted', value ? 'true' : 'false');
  };

  const setPersonalizationCompleted = async (value) => {
    setPersonalizationCompletedState(!!value);
    await AsyncStorage.setItem('personalizationCompleted', value ? 'true' : 'false');
  };

  // State for branches, semesters, subjects, and questions
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);

  // User Preferences state
  const [userPreferences, setUserPreferences] = useState({});

  // Load preferences from AsyncStorage on mount
  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPrefs = await AsyncStorage.getItem('userPreferences');
        if (storedPrefs) {
          setUserPreferences(JSON.parse(storedPrefs));
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    loadPreferences();
  }, []);

  // Function to update a single preference and persist it
  const updatePreference = (key, value) => {
    setUserPreferences(prev => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem('userPreferences', JSON.stringify(updated));
      return updated;
    });
  };

  // Loading and error states
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
      return [];
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch branches. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Fetch semesters for a specific branch
  const fetchSemesters = useCallback(async (branchId) => {
    if (!branchId) return [];
    
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`/branches/${branchId}/semesters`);
      if (response.data.success) {
        setSemesters(response.data.data);
        return response.data.data;
      }
      return [];
    } catch (error) {
      setError('Failed to fetch semesters. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Fetch subjects for a specific semester
  const fetchSubjects = useCallback(async (semesterId) => {
    if (!semesterId) return [];
    
    setLoading(true);
    setError(null);
    try {
      const response = await authAxios.get(`/semesters/${semesterId}/subjects`);
      if (response.data.success) {
        setSubjects(response.data.data);
        return response.data.data;
      }
      return [];
    } catch (error) {
      setError('Failed to fetch subjects. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Fetch questions for a specific subject
  const fetchQuestions = useCallback(async (subjectId, filters = {}) => {
    if (!subjectId) return { questions: [], pagination: {} };
    
    setLoading(true);
    setError(null);
    try {
      // Build query string from filters
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
      return { questions: [], pagination: {} };
    } catch (error) {
      setError('Failed to fetch questions. Please try again.');
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
      // Build query string from filters and search query
      const queryParams = new URLSearchParams();
      queryParams.append('q', searchQuery);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await authAxios.get(`/questions?${queryParams.toString()}`);
      
      if (response.data.success) {
        const { data, count, totalPages, currentPage } = response.data;
        return {
          questions: data,
          pagination: { count, totalPages, currentPage }
        };
      }
      return { questions: [], pagination: {} };
    } catch (error) {
      setError('Failed to search questions. Please try again.');
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
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      setError('Failed to fetch branch details. Please try again.');
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
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      setError('Failed to fetch semester details. Please try again.');
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
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      setError('Failed to fetch subject details. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Set current branch and fetch its semesters
  const selectBranch = useCallback(async (branch) => {
    setCurrentBranch(branch);
    setCurrentSemester(null);
    setCurrentSubject(null);
    if (branch && branch._id) {
      return await fetchSemesters(branch._id);
    }
    return [];
  }, [fetchSemesters]);

  // Set current semester and fetch its subjects
  const selectSemester = useCallback(async (semester) => {
    setCurrentSemester(semester);
    setCurrentSubject(null);
    if (semester && semester._id) {
      return await fetchSubjects(semester._id);
    }
    return [];
  }, [fetchSubjects]);

  // Set current subject and fetch its questions
  const selectSubject = useCallback(async (subject, filters = {}) => {
    setCurrentSubject(subject);
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

  // Value object that will be provided to consumers of this context
  const value = {
    // App-related
    onboardingCompleted,
    setOnboardingCompleted,

    // Data
    branches,
    semesters,
    subjects,
    questions,
    currentBranch,
    currentSemester,
    currentSubject,
    loading,
    error,

    // User Preferences
    userPreferences,
    updatePreference,

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
