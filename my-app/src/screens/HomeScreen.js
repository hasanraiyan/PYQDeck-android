

// React and other imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {
  const { logout } = useAuth();
  const {
    clearSelections, setOnboardingCompleted, userPreferences,
    personalizationCompleted, updatePreference,
    currentBranch, currentSemester,
    getBranchDetails, getSemesterDetails,
    branches, semesters,
    fetchBranches, fetchSemesters,
  } = useApp();

  // Local state for fetched branch/semester
  const [branchDetails, setBranchDetails] = useState(null);
  const [semesterDetails, setSemesterDetails] = useState(null);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [loadingSemester, setLoadingSemester] = useState(false);

  // Ensure branches are loaded on mount
  useEffect(() => {
    if (!branches || branches.length === 0) {
      fetchBranches && fetchBranches();
    }
    // eslint-disable-next-line
  }, []);

  // Ensure semesters are loaded when branch becomes resolved
  useEffect(() => {
    let branchId = null;
    if (currentBranch && currentBranch._id) {
      branchId = currentBranch._id;
    } else if (userPreferences && userPreferences.branch && Array.isArray(branches) && branches.length > 0) {
      // userPreferences.branch may be a code
      const found = branches.find(b => b.branch_code === userPreferences.branch);
      branchId = found ? found._id : null;
    }
    if (branchId && fetchSemesters) {
      fetchSemesters(branchId);
    }
    // eslint-disable-next-line
  }, [currentBranch, userPreferences?.branch, branches]);

  // Fetch full branch details (fix: if userPreferences.branch is a code, lookup _id in branches)
  useEffect(() => {
    const fetchBranch = async () => {
      setLoadingBranch(true);
      if (currentBranch && currentBranch._id) {
        setBranchDetails(currentBranch);
      } else if (userPreferences && userPreferences.branch) {
        let branchIdToFetch = userPreferences.branch;
        // Check if branchIdToFetch is probably not an ObjectId (MongoDB _id is 24 char hex)
        if (typeof branchIdToFetch === 'string' && branchIdToFetch.length < 24 && Array.isArray(branches) && branches.length > 0) {
          // Assume it's a "branch_code"
          const found = branches.find(b => b.branch_code === branchIdToFetch);
          branchIdToFetch = found ? found._id : branchIdToFetch;
        }
        // Only fetch if we have a real id string (should be 24 chars)
        if (typeof branchIdToFetch === 'string' && branchIdToFetch.length === 24) {
          const details = await getBranchDetails(branchIdToFetch);
          setBranchDetails(details);
        } else {
          setBranchDetails(null);
        }
      } else {
        setBranchDetails(null);
      }
      setLoadingBranch(false);
    };
    fetchBranch();
    // eslint-disable-next-line
  }, [currentBranch, userPreferences?.branch, branches]);

  // Fetch full semester details (improved: lookup _id by number if needed)
  useEffect(() => {
    const fetchSemester = async () => {
      setLoadingSemester(true);
      if (currentSemester && currentSemester._id) {
        setSemesterDetails(currentSemester);
      } else if (userPreferences && userPreferences.semester) {
        let semesterIdToFetch = userPreferences.semester;
        // If it's a number, not ObjectId, try to find in semesters list.
        // This assumes context provides "semesters" (all for selected branch).
        if (
          (typeof semesterIdToFetch === 'number' || (typeof semesterIdToFetch === 'string' && semesterIdToFetch.length < 24))
          && Array.isArray(semesters) && semesters.length > 0
        ) {
          // Number or short string (code?), so match by semester.number
          // Note: semester.number may be a number or string per API
          const found = semesters.find(
            s => parseInt(s.number, 10) === parseInt(semesterIdToFetch, 10)
          );
          semesterIdToFetch = found ? found._id : semesterIdToFetch;
        }
        // Only fetch if we have a real id string (should be 24 chars)
        if (typeof semesterIdToFetch === 'string' && semesterIdToFetch.length === 24) {
          const details = await getSemesterDetails(semesterIdToFetch);
          setSemesterDetails(details);
        } else {
          setSemesterDetails(null);
        }
      } else {
        setSemesterDetails(null);
      }
      setLoadingSemester(false);
    };
    fetchSemester();
    // eslint-disable-next-line
  }, [currentSemester, userPreferences?.semester, semesters]);

  // Resets onboarding/personalization context to defaults before logout.
  const handleLogout = async () => {
    if (clearSelections) clearSelections();
    if (setOnboardingCompleted) setOnboardingCompleted(false);

    if (updatePreference) {
      updatePreference('branch', null);
      updatePreference('semester', null);
      updatePreference('college', '');
      updatePreference('goal', null);
      updatePreference('frequency', null);
      updatePreference('preferredContent', null);
      updatePreference('notificationsEnabled', true);
      updatePreference('language', 'English');
    }

    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to PYQ Deck!</Text>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Your Preferences</Text>
        {userPreferences
          ? (
            <View>
              <Text style={styles.description}>User ID: {userPreferences.userId || '-'}</Text>
              <Text style={styles.description}>College: {userPreferences.college || '-'}</Text>
              <Text style={styles.description}>Goal: {userPreferences.goal || '-'}</Text>
              <Text style={styles.description}>Frequency: {userPreferences.frequency || '-'}</Text>
              <Text style={styles.description}>Preferred Content: {userPreferences.preferredContent || '-'}</Text>
              <Text style={styles.description}>Notifications: {userPreferences.notifications ? 'Enabled' : 'Disabled'}</Text>
              <Text style={styles.description}>Language: {userPreferences.language || '-'}</Text>
            </View>
          )
          : <Text style={styles.description}>No preferences found.</Text>
        }
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Your Branch</Text>
        {loadingBranch ? (
          <ActivityIndicator />
        ) : branchDetails ? (
          <View>
            <Text style={styles.description}>
              Name: {branchDetails.name || '-'}
            </Text>
            <Text style={styles.description}>
              Branch Code: {branchDetails.branch_code || '-'}
            </Text>
            {/* Optionally show icon */}
            <Text style={styles.description}>
              Icon: {branchDetails.icon?.name ? `${branchDetails.icon.set} / ${branchDetails.icon.name}` : '-'}
            </Text>
            <Text style={styles.description}>
              Branch ID: {branchDetails._id || '-'}
            </Text>
          </View>
        ) : (
          <Text style={styles.description}>No branch selected.</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Your Semester</Text>
        {loadingSemester ? (
          <ActivityIndicator />
        ) : semesterDetails ? (
          <View>
            <Text style={styles.description}>
              Semester Number: {semesterDetails.number || '-'}
            </Text>
            <Text style={styles.description}>
              Semester Code: {semesterDetails.semester_code || '-'}
            </Text>
            <Text style={styles.description}>
              Semester ID: {semesterDetails._id || '-'}
            </Text>
            {/* Optionally show branch info from populated object */}
            <Text style={styles.description}>
              Branch: {semesterDetails.branch?.name || '-'}
            </Text>
          </View>
        ) : (
          <Text style={styles.description}>No semester selected.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        activeOpacity={0.85}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingTop: 40,
  },
  header: {
    width: '100%',
    padding: 20,
    backgroundColor: '#0984e3',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  content: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 24,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 36,
    backgroundColor: '#e17055',
    paddingVertical: 13,
    paddingHorizontal: 45,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#e17055',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
});
