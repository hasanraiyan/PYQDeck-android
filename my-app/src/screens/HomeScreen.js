// React and other imports
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// --- EXPO ICONS IMPORT ---
import * as ExpoVectorIcons from '@expo/vector-icons';
import { MaterialCommunityIcons as DetailRowIcon } from '@expo/vector-icons'; // For DetailRow labels

const { width } = Dimensions.get('window');

// Helper component for detail rows (uses DetailRowIcon)
const DetailRow = ({ label, value, iconName, iconColor = '#555' }) => (
  <View style={styles.detailRow}>
    {iconName && <DetailRowIcon name={iconName} size={20} color={iconColor} style={styles.detailIcon} />}
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

// Function to render the actual icon from branch or semester data
const renderActualIcon = (iconData, defaultIconName = "help-circle-outline", size = 24, color = '#0984e3') => {
  if (iconData && iconData.set && iconData.name) {
    const IconComponent = ExpoVectorIcons[iconData.set];
    if (IconComponent) {
      return <IconComponent name={iconData.name} size={size} color={color} />;
    }
    console.warn(`Icon set "${iconData.set}" not found or not correctly named in ExpoVectorIcons. Using fallback.`);
    return <DetailRowIcon name={defaultIconName} size={size} color="#888" />;
  }
  return <DetailRowIcon name={defaultIconName} size={size} color="#888" />;
};


export default function HomeScreen() {
  const { logout, currentUser } = useAuth();
  const {
    clearSelections, setOnboardingCompleted, userPreferences,
    updatePreference,
    currentBranch: contextCurrentBranch,
    currentSemester: contextCurrentSemester,
    getBranchDetails, getSemesterDetails,
    branches, semesters,
    fetchBranches, fetchSemesters,
  } = useApp();

  const [branchDetails, setBranchDetails] = useState(null);
  const [semesterDetails, setSemesterDetails] = useState(null);
  const [loadingBranch, setLoadingBranch] = useState(true);
  const [loadingSemester, setLoadingSemester] = useState(true);

  // Determine display name and initial
  const displayName = currentUser?.name || userPreferences?.userId || 'User';
  const avatarInitialDisplay = userPreferences?.name
    ? userPreferences.name.charAt(0).toUpperCase()
    : (userPreferences?.userId ? userPreferences.userId.charAt(0).toUpperCase() : 'U');


  // Ensure branches are loaded on mount
  useEffect(() => {
    if (fetchBranches && (!branches || branches.length === 0)) {
      console.log("HomeScreen: Fetching branches...");
      fetchBranches();
    }
    // eslint-disable-next-line
  }, [fetchBranches]);

  // Ensure semesters are loaded when a branch ID is resolved
  useEffect(() => {
    let branchIdToLoadSemestersFor = null;
    if (contextCurrentBranch && contextCurrentBranch._id) {
      branchIdToLoadSemestersFor = contextCurrentBranch._id;
    } else if (branchDetails && branchDetails._id) {
      branchIdToLoadSemestersFor = branchDetails._id;
    } else if (userPreferences && userPreferences.branch && Array.isArray(branches) && branches.length > 0) {
      const found = branches.find(b => b.branch_code === userPreferences.branch || b._id === userPreferences.branch);
      branchIdToLoadSemestersFor = found ? found._id : null;
    }

    if (branchIdToLoadSemestersFor && fetchSemesters && (!semesters || semesters.length === 0 || (semesters[0]?.branch?._id !== branchIdToLoadSemestersFor && semesters[0]?.branch !== branchIdToLoadSemestersFor))) {
        console.log("HomeScreen: Fetching semesters for branch ID:", branchIdToLoadSemestersFor);
        fetchSemesters(branchIdToLoadSemestersFor);
    }
    // eslint-disable-next-line
  }, [contextCurrentBranch, branchDetails, userPreferences?.branch, branches, fetchSemesters]);


  // Fetch full branch details
  useEffect(() => {
    const fetchBranchData = async () => {
      setLoadingBranch(true);
      let details = null;

      if (contextCurrentBranch && contextCurrentBranch._id && contextCurrentBranch.name && contextCurrentBranch.branch_code) {
        details = contextCurrentBranch;
      }
      else if (userPreferences && userPreferences.branch) {
        let branchIdToFetch = userPreferences.branch;
        if (typeof branchIdToFetch === 'string' && branchIdToFetch.length < 24 && Array.isArray(branches) && branches.length > 0) {
          const found = branches.find(b => b.branch_code === branchIdToFetch);
          branchIdToFetch = found ? found._id : null;
        }
        if (typeof branchIdToFetch === 'string' && branchIdToFetch.length === 24) {
            if (contextCurrentBranch && contextCurrentBranch._id === branchIdToFetch && (!contextCurrentBranch.name || !contextCurrentBranch.branch_code)) {
                 details = await getBranchDetails(branchIdToFetch);
            } else if (!contextCurrentBranch || contextCurrentBranch._id !== branchIdToFetch) {
                 details = await getBranchDetails(branchIdToFetch);
            }
        }
      }
      else if (contextCurrentBranch && contextCurrentBranch._id && (!contextCurrentBranch.name || !contextCurrentBranch.branch_code)) {
          details = await getBranchDetails(contextCurrentBranch._id);
      }

      setBranchDetails(details);
      setLoadingBranch(false);
    };

    if (getBranchDetails && Array.isArray(branches)) {
      fetchBranchData();
    } else if (!Array.isArray(branches)) {
      setLoadingBranch(true);
    } else {
      setLoadingBranch(false);
      setBranchDetails(null);
    }
    // eslint-disable-next-line
  }, [contextCurrentBranch, userPreferences?.branch, branches, getBranchDetails]);

  // Fetch full semester details
  useEffect(() => {
    const fetchSemesterData = async () => {
      setLoadingSemester(true);
      let details = null;

      if (contextCurrentSemester && contextCurrentSemester._id && contextCurrentSemester.number && contextCurrentSemester.semester_code) {
        details = contextCurrentSemester;
      }
      else if (userPreferences && userPreferences.semester) {
        let semesterIdToFetch = userPreferences.semester;
        if ((typeof semesterIdToFetch === 'number' || (typeof semesterIdToFetch === 'string' && semesterIdToFetch.length < 24)) && Array.isArray(semesters) && semesters.length > 0) {
          const prefSemesterStr = String(semesterIdToFetch);
          const found = semesters.find(
            s => String(s.number) === prefSemesterStr || s.semester_code === prefSemesterStr
          );
          semesterIdToFetch = found ? found._id : null;
        }
        if (typeof semesterIdToFetch === 'string' && semesterIdToFetch.length === 24) {
            if (contextCurrentSemester && contextCurrentSemester._id === semesterIdToFetch && (!contextCurrentSemester.number || !contextCurrentSemester.semester_code)) {
                details = await getSemesterDetails(semesterIdToFetch);
            } else if (!contextCurrentSemester || contextCurrentSemester._id !== semesterIdToFetch) {
                details = await getSemesterDetails(semesterIdToFetch);
            }
        }
      }
      else if (contextCurrentSemester && contextCurrentSemester._id && (!contextCurrentSemester.number || !contextCurrentSemester.semester_code)) {
         details = await getSemesterDetails(contextCurrentSemester._id);
      }

      setSemesterDetails(details);
      setLoadingSemester(false);
    };

     if (getSemesterDetails && Array.isArray(semesters)) {
      fetchSemesterData();
    } else if (!Array.isArray(semesters) && branchDetails && branchDetails._id) {
      setLoadingSemester(true);
    } else {
      setLoadingSemester(false);
      setSemesterDetails(null);
    }
    // eslint-disable-next-line
  }, [contextCurrentSemester, userPreferences?.semester, semesters, getSemesterDetails, branchDetails]);

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
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>My Dashboard</Text>

      {/* User Profile Section -- MODIFIED HERE -- */}
      <View style={[styles.card, styles.profileCard]}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {avatarInitialDisplay}
            </Text>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            Welcome, {displayName}!
          </Text>
          <View style={styles.profileDetailRow}>
            <DetailRowIcon name="bank" size={16} color="#636e72" style={styles.profileIcon} />
            <Text style={styles.profileCollege}>
              {userPreferences?.college || 'No college specified'}
            </Text>
          </View>
        </View>
      </View>

      {/* Preferences Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Study Preferences</Text>
        {userPreferences ? (
          <>
            <DetailRow label="Goal" value={userPreferences.goal} iconName="target" />
            <DetailRow label="Frequency" value={userPreferences.frequency} iconName="calendar-clock-outline" />
            <DetailRow label="Content" value={userPreferences.preferredContent} iconName="book-open-variant" />
            <DetailRow
                label="Notifications"
                value={userPreferences.notificationsEnabled ? 'Enabled' : 'Disabled'}
                iconName={userPreferences.notificationsEnabled ? "bell-ring-outline" : "bell-off-outline"}
            />
            <DetailRow label="Language" value={userPreferences.language} iconName="translate" />
          </>
        ) : (
          <Text style={styles.placeholderText}>Loading preferences or not set.</Text>
        )}
      </View>

      {/* Branch Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Branch</Text>
        {loadingBranch ? (
          <ActivityIndicator size="large" color={styles.activityIndicator.color} />
        ) : branchDetails ? (
          <>
            <View style={styles.mainItemContainer}>
              {renderActualIcon(branchDetails.icon, "school-outline", 28, styles.mainItemText.color)}
              <Text style={styles.mainItemText}>
                {branchDetails.name || '-'}
              </Text>
            </View>
            <DetailRow label="Code" value={branchDetails.branch_code} iconName="barcode-scan" />
            {branchDetails.icon && branchDetails.icon.set && branchDetails.icon.name && (
              <DetailRow
                label="Icon Source"
                value={`${branchDetails.icon.set} / ${branchDetails.icon.name}`}
                iconName="information-outline"
              />
            )}
          </>
        ) : (
          <Text style={styles.placeholderText}>No branch selected or found. Please check settings.</Text>
        )}
      </View>

      {/* Semester Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Semester</Text>
        {loadingSemester ? (
          <ActivityIndicator size="large" color={styles.activityIndicator.color} />
        ) : semesterDetails ? (
          <>
            <View style={styles.mainItemContainer}>
              <DetailRowIcon name="counter" size={28} color={styles.mainItemText.color} />
              <Text style={styles.mainItemText}>
                Semester {semesterDetails.number || '-'}
              </Text>
            </View>
            <DetailRow label="Code" value={semesterDetails.semester_code} iconName="barcode" />
            {semesterDetails.branch && (
                <DetailRow
                    label="Branch Context"
                    value={semesterDetails.branch.name || semesterDetails.branch}
                    iconName={semesterDetails.branch.icon ? undefined : "information-outline"}
                    iconColor="#555"
                >
                    {semesterDetails.branch.icon && typeof semesterDetails.branch.icon === 'object' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                            {renderActualIcon(semesterDetails.branch.icon, "school-outline", 18, styles.detailValue.color)}
                        </View>
                    )}
                </DetailRow>
            )}
          </>
        ) : (
          <Text style={styles.placeholderText}>No semester selected or found. Please check settings.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        activeOpacity={0.8}
      >
        <DetailRowIcon name="logout" size={20} color="white" style={styles.logoutIcon} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  container: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a2533',
    marginBottom: 25,
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: width * 0.93,
    marginBottom: 22,
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e8edf1',
    paddingBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#8492a6',
    textAlign: 'center',
    paddingVertical: 15,
    fontStyle: 'italic',
  },
  activityIndicator: {
      color: '#0984e3',
      marginVertical: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 18,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0984e3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#e0f2fe',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '600',
    color: '#273444',
    marginBottom: 5,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    marginRight: 8,
  },
  profileCollege: {
    fontSize: 15,
    color: '#5a6b7b',
  },
  mainItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  mainItemText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 12,
    flexShrink: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingVertical: 3,
  },
  detailIcon: {
    marginRight: 12,
    width: 22,
    marginTop: 2,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#4a5c6d',
    fontWeight: '500',
    marginRight: 8,
    minWidth: 90,
  },
  detailValue: {
    fontSize: 15,
    color: '#273444',
    flex: 1,
    textAlign: 'left',
  },
  logoutButton: {
    marginTop: 15,
    backgroundColor: '#d9534f',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#c9302c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: width * 0.93,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});