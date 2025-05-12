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
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const SemesterScreen = () => {
  const {
    semesters,
    fetchSemesters,
    loading: appContextLoading,
    error: appContextError,
    updatePreference,
    userPreferences,
  } = useApp();
  const navigation = useNavigation();
  const [selectedSemester, setSelectedSemester] = useState(userPreferences?.semester || null);
  const branch = userPreferences?.branch;

  useEffect(() => {
    const branchId = typeof branch === 'object' && branch?._id ? branch._id : branch;
    if (branchId) {
      fetchSemesters(branchId);
    } else {
      Alert.alert('Navigation Error', 'Branch not set. Returning back.');
      navigation.goBack();
    }
  }, [branch, fetchSemesters, navigation]);

  const handleSelect = (semester) => setSelectedSemester(semester);

  const handleNext = () => {
    if (!selectedSemester) {
      Alert.alert('Selection Required', 'Please select your semester to continue.');
      return;
    }
    updatePreference('semester', selectedSemester);
    navigation.navigate('Preferences');
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedSemester?._id === item._id;
    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={[styles.item, isSelected && styles.itemSelected]}
        android_ripple={{ color: COLORS.lightBorder }}
      >
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>Semester {item.number}</Text>
        {isSelected && <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />}
      </Pressable>
    );
  };

  return (
    <OnboardingWrapper
      title="Select Your Semester"
      subtitle="Tell us which semester you're currently in."
      disableScroll
    >
      {appContextLoading && semesters.length === 0 ? (
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />
      ) : appContextError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load semesters.</Text>
          <NextButton title="Retry" onPress={() => fetchSemesters(branch?._id || branch)} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={semesters}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <NextButton
            title="Next"
            onPress={handleNext}
            disabled={!selectedSemester}
            containerStyle={styles.nextBtn}
          />
        </View>
      )}
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 40 },
  errorBox: { alignItems: 'center', paddingTop: 30 },
  errorText: { color: COLORS.error, marginBottom: 12 },
  listContainer: { flex: 1, width: '100%' },
  listContent: { paddingVertical: 20 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    marginVertical: 6,
  },
  itemSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.textBody,
  },
  itemTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  nextBtn: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: width * 0.9,
  },
});

export default SemesterScreen;