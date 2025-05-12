// ProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import * as ExpoVectorIcons from '@expo/vector-icons';
import { MaterialCommunityIcons as DetailRowIcon } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DetailRow = ({ label, value, iconName, iconColor = COLORS.textSecondary }) => (
  <View style={styles.detailRow}>
    {iconName && <DetailRowIcon name={iconName} size={20} color={iconColor} style={styles.detailIcon} />}
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

const renderActualIcon = (iconData, defaultIconName = "help-circle-outline", size = 24, color = COLORS.primary) => {
  if (iconData && iconData.set && iconData.name) {
    const IconComponent = ExpoVectorIcons[iconData.set];
    if (IconComponent) {
      return <IconComponent name={iconData.name} size={size} color={color} />;
    }
    return <DetailRowIcon name={defaultIconName} size={size} color={COLORS.textSecondary} />;
  }
  return <DetailRowIcon name={defaultIconName} size={size} color={COLORS.textSecondary} />;
};

export default function ProfileScreen() {
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

  const [testResults, setTestResults] = useState({});
  const [testLoading, setTestLoading] = useState("");
  function setTestResult(key, val) {
    setTestResults(prev => ({ ...prev, [key]: val }));
  }

  const displayName = currentUser?.name || userPreferences?.userId || 'User';
  const avatarInitialDisplay = userPreferences?.name
    ? userPreferences.name.charAt(0).toUpperCase()
    : (userPreferences?.userId ? userPreferences.userId.charAt(0).toUpperCase() : 'U');

  useEffect(() => {
    if (fetchBranches && (!branches || branches.length === 0)) {
      fetchBranches();
    }
  }, [fetchBranches]);

  useEffect(() => {
    let branchIdToLoadSemestersFor = null;
    if (contextCurrentBranch && contextCurrentBranch._id) {
      branchIdToLoadSemestersFor = contextCurrentBranch._id;
    } else if (branchDetails && branchDetails._id) {
      branchIdToLoadSemestersFor = branchDetails._id;
    } else if (userPreferences && userPreferences.branch && typeof userPreferences.branch === "object" && userPreferences.branch._id) {
      branchIdToLoadSemestersFor = userPreferences.branch._id;
    }
    if (branchIdToLoadSemestersFor && fetchSemesters && (!semesters || semesters.length === 0 || (semesters[0]?.branch?._id !== branchIdToLoadSemestersFor && semesters[0]?.branch !== branchIdToLoadSemestersFor))) {
      fetchSemesters(branchIdToLoadSemestersFor);
    }
  }, [contextCurrentBranch, branchDetails, userPreferences?.branch, branches, fetchSemesters]);

  useEffect(() => {
    const fetchBranchData = async () => {
      setLoadingBranch(true);
      let details = null;
      if (contextCurrentBranch && contextCurrentBranch._id && contextCurrentBranch.name && contextCurrentBranch.branch_code) {
        details = contextCurrentBranch;
      } else if (userPreferences && userPreferences.branch) {
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
      } else if (contextCurrentBranch && contextCurrentBranch._id && (!contextCurrentBranch.name || !contextCurrentBranch.branch_code)) {
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
  }, [contextCurrentBranch, userPreferences?.branch, branches, getBranchDetails]);

  useEffect(() => {
    const fetchSemesterData = async () => {
      setLoadingSemester(true);
      let details = null;
      if (contextCurrentSemester && contextCurrentSemester._id && contextCurrentSemester.number && contextCurrentSemester.semester_code) {
        details = contextCurrentSemester;
      } else if (
        userPreferences &&
        userPreferences.semester &&
        typeof userPreferences.semester === "object" &&
        userPreferences.semester._id &&
        userPreferences.semester.number
      ) {
        details = userPreferences.semester;
      } else if (userPreferences && userPreferences.semester) {
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
      } else if (contextCurrentSemester && contextCurrentSemester._id && (!contextCurrentSemester.number || !contextCurrentSemester.semester_code)) {
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
      colors={[COLORS.background, COLORS.lightGray]}
      start={{ x: 0, y: 0.2 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>My Dashboard</Text>

        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.avatarCircle}
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Branch</Text>
          <Text style={{ color: 'red', fontSize: 12, marginBottom: 5 }}>
            Debug: userPreferences.branch = {JSON.stringify(userPreferences?.branch)}
          </Text>
          <Text style={{ color: 'red', fontSize: 12, marginBottom: 5 }}>
            Debug: userPreferences = {JSON.stringify(userPreferences)}
          </Text>
          {userPreferences && userPreferences.branch && typeof userPreferences.branch === "object" ? (
            <>
              <View style={styles.mainItemContainer}>
                {renderActualIcon(userPreferences.branch.icon, "school-outline", 28, COLORS.primaryDark)}
                <Text style={styles.mainItemText}>
                  {userPreferences.branch.name || '-'}
                </Text>
              </View>
              <DetailRow label="Branch Code" value={userPreferences.branch.branch_code} iconName="barcode-scan" />
              <DetailRow label="Branch ID" value={userPreferences.branch._id} iconName="identifier" />
              <DetailRow label="Short Name" value={userPreferences.branch.short_name} iconName="format-letter-case" />
              {userPreferences.branch.icon && userPreferences.branch.icon.set && userPreferences.branch.icon.name && (
                <DetailRow
                  label="Icon Source"
                  value={`${userPreferences.branch.icon.set} / ${userPreferences.branch.icon.name}`}
                  iconName="information-outline"
                />
              )}
              {Object.entries(userPreferences.branch).map(([key, val]) => {
                if (
                  ["_id", "branch_code", "name", "short_name", "icon"].includes(key) ||
                  val === undefined ||
                  val === null ||
                  (typeof val === "object" && (key === "icon" || Array.isArray(val)))
                ) {
                  return null;
                }
                return <DetailRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={String(val)} iconName="information-outline" />;
              })}
            </>
          ) : loadingBranch ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <Text style={styles.placeholderText}>No branch selected or found. Please check settings.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Semester</Text>
          <Text style={{ color: 'red', fontSize: 12, marginBottom: 5 }}>
            Debug: userPreferences.semester = {JSON.stringify(userPreferences?.semester)}
          </Text>
          {loadingSemester ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : semesterDetails ? (
            <>
              <View style={styles.mainItemContainer}>
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Context Test Center</Text>
          <Text style={{ fontStyle: "italic", color: COLORS.textSecondary, marginBottom: 10 }}>
            Use these to fetch and view context data.
          </Text>
          <ScrollView horizontal style={{ marginBottom: 15 }}>
            <TouchableOpacity style={styles.testBtn} onPress={async () => {
              setTestLoading("branches");
              const res = await fetchBranches();
              setTestResult("branches", res);
              setTestLoading("");
            }}>
              <Text style={styles.testBtnText}>Fetch Branches</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testBtn} onPress={async () => {
              setTestLoading("semesters");
              if (userPreferences?.branch?._id) {
                const res = await fetchSemesters(userPreferences.branch._id);
                setTestResult("semesters", res);
              } else {
                setTestResult("semesters", "Select a branch first");
              }
              setTestLoading("");
            }}>
              <Text style={styles.testBtnText}>Fetch Semesters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testBtn} onPress={async () => {
              setTestLoading("subjects");
              if (userPreferences?.semester && userPreferences?.semester._id) {
                setTestResult("subjects", "Calling fetchSubjects with ID: " + userPreferences.semester._id);
                const res = await fetchSubjects(userPreferences.semester._id);
                setTestResult("subjects", res);
              } else {
                setTestResult("subjects", "Select a semester first (no semester._id)");
              }
              setTestLoading("");
            }}>
              <Text style={styles.testBtnText}>Fetch Subjects</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testBtn} onPress={async () => {
              setTestLoading("questions");
              if (userPreferences?.subject && userPreferences?.subject._id) {
                setTestResult("questions", "Calling fetchQuestions with subjectId: " + userPreferences.subject._id);
                const res = await fetchQuestions(userPreferences.subject._id);
                setTestResult("questions", res);
              } else {
                setTestResult("questions", "No subject selected! Select a subject after onboarding to use this.");
              }
              setTestLoading("");
            }}>
              <Text style={styles.testBtnText}>Fetch Questions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testBtn} onPress={async () => {
              setTestLoading("search");
              const res = await searchQuestions("engineering");
              setTestResult("search", res);
              setTestLoading("");
            }}>
              <Text style={styles.testBtnText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testBtn} onPress={async () => {
              setTestLoading("branchDetails");
              if (userPreferences?.branch?._id) {
                const res = await getBranchDetails(userPreferences.branch._id);
                setTestResult("branchDetails", res);
              } else {
                setTestResult("branchDetails", "Select branch");
              }
              setTestLoading("");
            }}>
              <Text style={styles.testBtnText}>Get Branch Details</Text>
            </TouchableOpacity>
          </ScrollView>
          <ScrollView style={{ maxHeight: 200 }}>
            {Object.keys(testResults).map((key) =>
              testLoading === key ? (
                <View key={key}><ActivityIndicator size="small" color={COLORS.primary} /><Text>  Loading {key}...</Text></View>
              ) : (
                <View key={key} style={{ marginBottom: 13 }}>
                  <Text style={{ fontWeight: "700", color: COLORS.primary }}>{key}</Text>
                  <Text selectable style={{ fontSize: 13, color: COLORS.textBody, backgroundColor: "#f7fafc", padding: 6, borderRadius: 8 }}>
                    {typeof testResults[key] === "object" ? JSON.stringify(testResults[key], null, 2) : String(testResults[key])}
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#999', marginBottom: 10 }]}
          onPress={async () => {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.removeItem('userPreferences');
            await AsyncStorage.removeItem('personalizationCompleted');
            alert('Onboarding data cleared!\nRestart the app or re-run onboarding for correct format.');
          }}
          accessibilityRole="button"
          accessibilityLabel="Clear onboarding and preferences"
          activeOpacity={0.8}
        >
          <DetailRowIcon name="refresh" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Clear Onboarding Data</Text>
        </TouchableOpacity>

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
  gradientBackground: { flex: 1 },
  scrollView: { flex: 1 },
  container: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 15 },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textTitle,
    marginBottom: 25,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    marginBottom: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textTitle,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
    paddingBottom: 10,
    textAlign: 'left',
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  profileCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, backgroundColor: COLORS.white },
  avatarWrapper: { marginRight: 15 },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 6,
  },
  avatarInitial: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textTitle, marginBottom: 4, letterSpacing: 0.1 },
  profileDetailRow: { flexDirection: 'row', alignItems: 'center' },
  profileIcon: { marginRight: 6 },
  profileCollege: { fontSize: 14, color: COLORS.textSecondary },
  mainItemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 4 },
  mainItemText: { fontSize: 18, fontWeight: '600', color: COLORS.textTitle, marginLeft: 10, flexShrink: 1 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingVertical: 3 },
  detailIcon: { marginRight: 10, width: 20, marginTop: 1, textAlign: 'center' },
  detailLabel: { fontSize: 14, color: COLORS.textBody, fontWeight: '500', marginRight: 8, minWidth: 80 },
  detailValue: { fontSize: 14, color: COLORS.textTitle, flex: 1, textAlign: 'left' },
  logoutButton: {
    marginTop: 25, backgroundColor: COLORS.error, paddingVertical: 14, paddingHorizontal: 30,
    borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: COLORS.error, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
    width: width * 0.9,
  },
  logoutIcon: { marginRight: 8 },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  testBtn: { backgroundColor: COLORS.primary, borderRadius: 20, marginRight: 10, paddingHorizontal: 18, paddingVertical: 7 },
  testBtnText: { color: '#fff', fontWeight: '700' },
});
