import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const BranchScreen = () => {
  const {
    branches,
    fetchBranches,
    loading: appContextLoading,
    error: appContextError,
    updatePreference,
    userPreferences,
  } = useApp();
  const navigation = useNavigation();
  const [selectedBranch, setSelectedBranch] = useState(userPreferences?.branch || null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSelectBranch = (branch) => setSelectedBranch(branch);

  const handleNext = () => {
    if (!selectedBranch) {
      Alert.alert('Selection Required', 'Please select your branch to continue.');
      return;
    }
    updatePreference('branch', selectedBranch);
    navigation.navigate('Semester');
  };

  const renderBranchItem = ({ item }) => {
    const isSelected = selectedBranch?._id === item._id;
    return (
      <Pressable
        onPress={() => handleSelectBranch(item)}
        style={[styles.itemContainer, isSelected && styles.selectedItemContainer]}
        android_ripple={{ color: COLORS.lightBorder }}
      >
        <Text
          style={[styles.itemText, isSelected && styles.selectedItemText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {isSelected && <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />}
      </Pressable>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} animated />
      <OnboardingWrapper
        title="Select Your Branch"
        subtitle="Choose your field of study to personalize your experience."
        disableScroll
      >
      {appContextLoading && branches.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : appContextError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error fetching branches. Pull to retry.</Text>
          <NextButton title="Retry" onPress={fetchBranches} />
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            data={branches}
            renderItem={renderBranchItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <NextButton
            title="Next"
            onPress={handleNext}
            disabled={!selectedBranch}
            containerStyle={styles.nextButton}
          />
        </View>
      )}
      </OnboardingWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 50 },
  errorContainer: { alignItems: 'center', paddingTop: 30 },
  errorText: { color: COLORS.error, marginBottom: 10 },
  listWrapper: { flex: 1, width: '100%' },
  listContent: { paddingVertical: 20 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  selectedItemContainer: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.textBody,
  },
  selectedItemText: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  nextButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: width * 0.9,
  },
});

export default BranchScreen;
