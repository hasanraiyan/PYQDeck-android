// my-app/src/screens/onboarding/PreferencesScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { COLORS } from '../../constants/Colors'; // Adjust path if your Colors.js is elsewhere

const PreferencesScreen = () => {
  const { updatePreference, userPreferences, loading: appContextLoading } = useApp(); // Added appContextLoading
  const navigation = useNavigation();

  // For DropDownPicker states
  const [goalOpen, setGoalOpen] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);

  // Initialize local state with values from AppContext or null
  const [goal, setGoal] = useState(userPreferences.goal || null);
  const [frequency, setFrequency] = useState(userPreferences.frequency || null);
  const [contentFormat, setContentFormat] = useState(userPreferences.preferredContent || null);

  const goalItems = [
    { label: 'Revising for Exams', value: 'Exam Revision' },
    { label: 'Clearing Backlogs', value: 'Backlogs' },
    { label: 'Regular Study/Browsing PYQs', value: 'Browsing' },
    { label: 'Preparing for a specific subject', value: 'Subject Prep' },
  ];

  const frequencyItems = [
    { label: 'Daily', value: 'Daily' },
    { label: 'A few times a week', value: 'Weekly' },
    { label: 'Mainly during exams (Exam-Cram)', value: 'Exam-Cram' },
  ];

  const contentFormatItems = [
    { label: 'Multiple Choice Questions (MCQs)', value: 'MCQ' },
    { label: 'Theory/Descriptive Questions', value: 'Theory' },
    { label: 'A mix of both', value: 'Mixed' },
  ];

  const handleNext = () => {
    if (!goal || !frequency || !contentFormat) {
      Alert.alert("All Fields Required", "Please make a selection for all options.");
      return;
    }
    updatePreference('goal', goal);
    updatePreference('frequency', frequency);
    updatePreference('preferredContent', contentFormat);
    navigation.navigate('NotificationSettings');
  };
  
  // Close other pickers when one opens
  // This ensures only one dropdown is open at a time, preventing overlap issues.
  const onGoalOpenCallback = (isOpen) => {
    if (isOpen) {
      setFrequencyOpen(false);
      setContentOpen(false);
    }
  };
  const onFrequencyOpenCallback = (isOpen) => {
    if (isOpen) {
      setGoalOpen(false);
      setContentOpen(false);
    }
  };
  const onContentOpenCallback = (isOpen) => {
    if (isOpen) {
      setGoalOpen(false);
      setFrequencyOpen(false);
    }
  };


  return (
    <OnboardingWrapper title="Your Learning Style" subtitle="Help us tailor PYQDeck to your needs.">
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>What's your primary goal?</Text>
        <DropDownPicker
          open={goalOpen}
          value={goal}
          items={goalItems}
          setOpen={setGoalOpen}
          setValue={setGoal}
          onOpen={() => onGoalOpenCallback(true)} // Call utility on open
          placeholder="Select your main objective"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode={Platform.OS === 'ios' ? "SCROLLVIEW" : "MODAL"} // MODAL is often better on Android
          zIndex={3000} // Higher zIndex for the first picker
          zIndexInverse={1000}
          disabled={appContextLoading}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>How often do you plan to use PYQDeck?</Text>
        <DropDownPicker
          open={frequencyOpen}
          value={frequency}
          items={frequencyItems}
          setOpen={setFrequencyOpen}
          setValue={setFrequency}
          onOpen={() => onFrequencyOpenCallback(true)}
          placeholder="Select your study frequency"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode={Platform.OS === 'ios' ? "SCROLLVIEW" : "MODAL"}
          zIndex={2000} // Middle zIndex
          zIndexInverse={2000}
          disabled={appContextLoading}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Preferred question format?</Text>
        <DropDownPicker
          open={contentOpen}
          value={contentFormat}
          items={contentFormatItems}
          setOpen={setContentOpen}
          setValue={setContentFormat}
          onOpen={() => onContentOpenCallback(true)}
          placeholder="Select content type"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode={Platform.OS === 'ios' ? "SCROLLVIEW" : "MODAL"}
          zIndex={1000} // Lower zIndex
          zIndexInverse={3000}
          disabled={appContextLoading}
        />
      </View>

      <View style={styles.buttonWrapper}>
        <NextButton 
            title="Next" 
            onPress={handleNext} 
            disabled={!goal || !frequency || !contentFormat || appContextLoading} 
        />
      </View>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: '100%',
    marginBottom: 20, 
    // DropDownPicker adds its own margins, so less needed here if listMode is SCROLLVIEW
    // For MODAL mode, this marginBottom is more relevant.
    ...(Platform.OS !== 'android' && { zIndex: 1 }), // Helps with iOS overlap if not using zIndex prop correctly
  },
  label: {
    fontSize: 16,
    color: COLORS.textTitle,
    marginBottom: 10,
    fontWeight: '500',
  },
  dropdown: {
    borderColor: COLORS.lightBorder,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    height: 50,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.textBody,
  },
  dropdownPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  dropdownContainer: {
    borderColor: COLORS.lightBorder,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.shadowColor, // Optional: add shadow to dropdown list
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 20, // Ensure space above the button
    alignItems: 'center', // Center the button if it's not full width
  }
});

export default PreferencesScreen;