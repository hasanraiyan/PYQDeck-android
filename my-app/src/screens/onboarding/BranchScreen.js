import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { COLORS } from '../../constants/Colors';

const BranchScreen = () => {
  const { branches, fetchBranches, loading: appContextLoading, error: appContextError, updatePreference, userPreferences } = useApp();
  const navigation = useNavigation();
  // Ensure userPreferences is always an object
  const safeUserPreferences = userPreferences || {};
  const [selectedBranch, setSelectedBranch] = useState(safeUserPreferences.branch || null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
  };

  const handleNext = () => {
    if (!selectedBranch) {
      Alert.alert("Selection Required", "Please select your branch to continue.");
      return;
    }
    updatePreference('branch', selectedBranch);
    navigation.navigate('Semester');
  };

  if (appContextLoading && branches.length === 0) {
    return (
      <OnboardingWrapper title="Select Your Branch" subtitle="Loading branches..." disableScroll>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }}/>
      </OnboardingWrapper>
    );
  }

  if (appContextError) {
     return (
      <OnboardingWrapper title="Select Your Branch" subtitle="Choose your field of study." disableScroll>
        <Text style={styles.errorText}>Error fetching branches: {appContextError}</Text>
        <TouchableOpacity onPress={fetchBranches} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </OnboardingWrapper>
     )
  }


  const renderBranchItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedBranch?._id === item._id && styles.selectedItemContainer,
      ]}
      onPress={() => handleSelectBranch(item)}
    >
      <Text style={[styles.itemText, selectedBranch?._id === item._id && styles.selectedItemText]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <OnboardingWrapper title="Select Your Branch" subtitle="Choose your field of study to personalize your experience." disableScroll>
      <FlatList
        data={branches}
        renderItem={renderBranchItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        extraData={selectedBranch}
      />
      <NextButton title="Next" onPress={handleNext} disabled={!selectedBranch || appContextLoading} />
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
    maxHeight: '70%', // Ensure button is visible
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

export default BranchScreen;