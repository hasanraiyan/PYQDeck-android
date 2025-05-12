// React and other imports
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions,
} from 'react-native';
// Add LinearGradient for backgrounds
import { LinearGradient } from 'expo-linear-gradient';
// Import custom COLORS palette
import { COLORS } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// --- EXPO ICONS IMPORT ---
import * as ExpoVectorIcons from '@expo/vector-icons';
import { MaterialCommunityIcons as DetailRowIcon } from '@expo/vector-icons'; // For DetailRow labels

const { width } = Dimensions.get('window');

// Helper component for detail rows (uses DetailRowIcon)
const DetailRow = ({ label, value, iconName, iconColor = COLORS.textSecondary }) => (
  <View style={styles.detailRow}>
    {iconName && <DetailRowIcon name={iconName} size={20} color={iconColor} style={styles.detailIcon} />}
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

// Function to render the actual icon from branch or semester data
const renderActualIcon = (iconData, defaultIconName = "help-circle-outline", size = 24, color = COLORS.primary) => {
  if (iconData && iconData.set && iconData.name) {
    const IconComponent = ExpoVectorIcons[iconData.set];
    if (IconComponent) {
      return <IconComponent name={iconData.name} size={size} color={color} />;
    }
    console.warn(`Icon set "${iconData.set}" not found or not correctly named in ExpoVectorIcons. Using fallback.`);
    return <DetailRowIcon name={defaultIconName} size={size} color={COLORS.textSecondary} />;
  }
  return <DetailRowIcon name={defaultIconName} size={size} color={COLORS.textSecondary} />;
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
    <LinearGradient
      colors={[COLORS.background, COLORS.lightGray]} // Softer background gradient
      start={{ x: 0, y: 0.2 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>My Dashboard</Text>

        {/* User Profile Section -- MODIFIED HERE -- */}
        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]} // Gradient for avatar background
              style={styles.avatarCircle} // Apply to avatarCircle directly
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarInitial}>
                {avatarInitialDisplay}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Welcome, {displayName}!
            </Text>
            <View style={styles.profileDetailRow}>
              <DetailRowIcon name="bank" size={16} color={COLORS.textSecondary} style={styles.profileIcon} />
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
            <DetailRow label="Goal" value={userPreferences.goal} iconName="target" iconColor={COLORS.primary} />
            <DetailRow label="Frequency" value={userPreferences.frequency} iconName="calendar-clock-outline" iconColor={COLORS.primary}/>
            <DetailRow label="Content" value={userPreferences.preferredContent} iconName="book-open-variant" iconColor={COLORS.primary}/>
            <DetailRow
                label="Notifications"
                value={userPreferences.notificationsEnabled ? 'Enabled' : 'Disabled'}
                iconName={userPreferences.notificationsEnabled ? "bell-ring-outline" : "bell-off-outline"}
                iconColor={COLORS.primary}
            />
            <DetailRow label="Language" value={userPreferences.language} iconName="translate" iconColor={COLORS.primary}/>
          </>
        ) : (
          <Text style={styles.placeholderText}>Loading preferences or not set.</Text>
        )}
      </View>

      {/* Branch Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Branch</Text>
        {loadingBranch ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : branchDetails ? (
          <>
            <View style={styles.mainItemContainer}>
              {renderActualIcon(branchDetails.icon, "school-outline", 28, COLORS.primaryDark)}
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
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : semesterDetails ? (
          <>
            <View style={styles.mainItemContainer}>
              {/* Using a more thematic icon color */}
              <DetailRowIcon name="counter" size={28} color={COLORS.primaryDark} />
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
                    iconColor={COLORS.textSecondary}
                >
                    {semesterDetails.branch.icon && typeof semesterDetails.branch.icon === 'object' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                            {renderActualIcon(semesterDetails.branch.icon, "school-outline", 18, COLORS.textBody)}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 30, // Increased top/bottom padding
    paddingHorizontal: 15,
  },
  screenTitle: {
    fontSize: 28, // Slightly larger
    fontWeight: 'bold',
    color: COLORS.textTitle, // Use textTitle for main screen title
    marginBottom: 25,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, // Added horizontal padding for the title itself
  },
  card: {
    backgroundColor: COLORS.white, // Solid white for cards
    borderRadius: 12, // Standardized border radius
    padding: 20,
    width: width * 0.9, // Standardized card width
    marginBottom: 20, // Standardized margin
    shadowColor: COLORS.shadowColor, // Use shadowColor from theme
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // cardGradientHeader: { // Removed
  // },
  cardTitle: {
    fontSize: 18, // Adjusted size
    fontWeight: '600', // Semi-bold
    color: COLORS.textTitle,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
    paddingBottom: 10,
    textAlign: 'left',
  },
  placeholderText: {
    fontSize: 14, // Adjusted size
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20, // More padding
    fontStyle: 'italic',
  },
  // activityIndicator style is applied directly in JSX with COLORS.primary
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20, // Adjusted padding
    backgroundColor: COLORS.white, // Ensure profile card also has solid background
  },
  avatarWrapper: {
    marginRight: 15,
  },
  // avatarGlow: { // Removed
  // },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor is handled by LinearGradient
    // borderWidth: 2, // Optional: keep border if desired over gradient
    // borderColor: COLORS.white, // Optional
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
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
    fontSize: 20, // Adjusted size
    fontWeight: 'bold',
    color: COLORS.textTitle, // Changed to textTitle for better readability
    marginBottom: 4,
    // Removed text shadow
    letterSpacing: 0.1,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    marginRight: 6,
  },
  profileCollege: {
    fontSize: 14,
    color: COLORS.textSecondary, // Use textSecondary for less emphasis
  },
  mainItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  mainItemText: {
    fontSize: 18, // Adjusted size
    fontWeight: '600',
    color: COLORS.textTitle,
    marginLeft: 10,
    flexShrink: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Kept as flex-start for potentially multi-line values
    marginBottom: 10,
    paddingVertical: 3,
  },
  detailIcon: {
    marginRight: 10,
    width: 20, // Standardized icon width
    marginTop: 1, // Fine-tune alignment
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textBody,
    fontWeight: '500', // Medium weight
    marginRight: 8,
    minWidth: 80, // Adjusted minWidth
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textTitle,
    flex: 1,
    textAlign: 'left',
  },
  logoutButton: {
    marginTop: 25,
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: width * 0.9, // Match card width
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600', // Semi-bold
  },
});
