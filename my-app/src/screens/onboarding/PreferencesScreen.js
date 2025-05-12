import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { COLORS } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const PreferencesScreen = () => {
  const { updatePreference, userPreferences, loading } = useApp();
  const navigation = useNavigation();

  const [values, setValues] = useState({
    goal: userPreferences.goal || '',
    frequency: userPreferences.frequency || '',
    preferredContent: userPreferences.preferredContent || '',
  });

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleNext = () => {
    const missing = [];
    if (!values.goal) missing.push('Primary Goal');
    if (!values.frequency) missing.push('Study Frequency');
    if (!values.preferredContent) missing.push('Content Format');

    if (missing.length) {
      Alert.alert('All Fields Required', `Please select: ${missing.join(', ')}.`);
      return;
    }

    // Save preferences
    updatePreference('goal', values.goal);
    updatePreference('frequency', values.frequency);
    updatePreference('preferredContent', values.preferredContent);

    navigation.navigate('NotificationSettings');
  };

  return (
    <OnboardingWrapper title="Your Learning Style" subtitle="Tailor PYQDeck to fit your habits.">

      {/* Goal Picker */}
      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Primary Goal</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={values.goal}
            onValueChange={(val) => handleChange('goal', val)}
            enabled={!loading}
          >
            <Picker.Item label="Select goal..." value="" />
            <Picker.Item label="Revising for Exams" value="Exam Revision" />
            <Picker.Item label="Clearing Backlogs" value="Backlogs" />
            <Picker.Item label="Regular Practice" value="Browsing" />
            <Picker.Item label="Subject-specific Prep" value="Subject Prep" />
          </Picker>
        </View>
      </View>

      {/* Frequency Picker */}
      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Study Frequency</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={values.frequency}
            onValueChange={(val) => handleChange('frequency', val)}
            enabled={!loading}
          >
            <Picker.Item label="Select frequency..." value="" />
            <Picker.Item label="Daily" value="Daily" />
            <Picker.Item label="Few times/wk" value="Weekly" />
            <Picker.Item label="Exam-Cram" value="Exam-Cram" />
          </Picker>
        </View>
      </View>

      {/* Content Format Picker */}
      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Content Format</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={values.preferredContent}
            onValueChange={(val) => handleChange('preferredContent', val)}
            enabled={!loading}
          >
            <Picker.Item label="Select format..." value="" />
            <Picker.Item label="MCQs" value="MCQ" />
            <Picker.Item label="Theory Questions" value="Theory" />
            <Picker.Item label="Mixed" value="Mixed" />
          </Picker>
        </View>
      </View>

      <NextButton
        title="Next"
        onPress={handleNext}
        disabled={loading}
        containerStyle={styles.nextBtn}
      />

    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  pickerWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: COLORS.textTitle,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  nextBtn: {
    marginTop: 32,
    width: width * 0.9,
    alignSelf: 'center',
  },
});

export default PreferencesScreen;
