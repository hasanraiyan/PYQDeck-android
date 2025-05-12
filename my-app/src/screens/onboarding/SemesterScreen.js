import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { COLORS } from '../../constants/Colors';

const SemesterScreen = () => {
  const { semesters, fetchSemesters, loading: appContextLoading, error: appContextError, updatePreference, userPreferences } = useApp();
  const navigation = useNavigation();
  // Ensure userPreferences is always an object
  const safeUserPreferences = userPreferences || {};
  const [selectedSemester, setSelectedSemester] = useState(safeUserPreferences.semester || null);

  const currentBranch = safeUserPreferences.branch; // Get from prefs set in previous screen

  useEffect(() => {
    // Accept both object and string forms for branch
    const branchId = typeof currentBranch === 'object' && currentBranch !== null ? currentBranch._id : currentBranch;
    if (branchId) {
      fetchSemesters(branchId);
    } else {
        // Should not happen if navigation flow is correct
        Alert.alert("Error", "Branch not selected. Please go back.");
        navigation.goBack();
    }
  }, [currentBranch, fetchSemesters, navigation]);

  const handleSelectSemester = (semester) => {
    setSelectedSemester(semester);
  };

  const handleNext = () => {
    if (!selectedSemester) {
      Alert.alert("Selection Required", "Please select your semester.");
      return;
    }
    updatePreference('semester', selectedSemester);
    navigation.navigate('Preferences');
  };

  if (appContextLoading && semesters.length === 0) {
    return (
      <OnboardingWrapper title="Select Your Semester" subtitle="Loading available semesters..." disableScroll>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }}/>
      </OnboardingWrapper>
    );
  }
  
  if (appContextError) {
     return (
      <OnboardingWrapper title="Select Your Semester" subtitle="Tell us which semester you are in." disableScroll>
        <Text style={styles.errorText}>Error fetching semesters: {appContextError}</Text>
         <TouchableOpacity onPress={() => {
            // Accept both object and string forms for branch
            const branchId = typeof currentBranch === 'object' && currentBranch !== null ? currentBranch._id : currentBranch;
            if (branchId) fetchSemesters(branchId);
         }} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </OnboardingWrapper>
     )
  }

  const renderSemesterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedSemester?._id === item._id && styles.selectedItemContainer,
      ]}
      onPress={() => handleSelectSemester(item)}
    >
      <Text style={[styles.itemText, selectedSemester?._id === item._id && styles.selectedItemText]}>
        Semester {item.number}
      </Text>
    </TouchableOpacity>
  );

  return (
    <OnboardingWrapper title="Select Your Semester" subtitle="Tell us which semester you are currently in." disableScroll>
      <FlatList
        data={semesters}
        renderItem={renderSemesterItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        extraData={selectedSemester}
      />
      <NextButton title="Next" onPress={handleNext} disabled={!selectedSemester || appContextLoading} />
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
    maxHeight: '70%',
  },
  itemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: 5,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  selectedItemContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    borderWidth: 2,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.textBody,
  },
  selectedItemText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
   errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  retryButtonText: {
    color: COLORS.white,
  }
});

export default SemesterScreen;