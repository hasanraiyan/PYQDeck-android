// my-app/src/screens/onboarding/NotificationSettingsScreen.js
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert, Dimensions, TextInput } from 'react-native'; // Added TextInput
import { useApp } from '../../context/AppContext';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { COLORS } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const NotificationSettingsScreen = () => {
  const { updatePreference, savePersonalizationPreferences, userPreferences, loading } = useApp();
  // Initialize local state for the switch from the context's userPreferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(userPreferences.notificationsEnabled);
  // Local state for optional college input
  const [collegeInput, setCollegeInput] = useState(userPreferences.college || '');


  const handleFinish = async () => {
    console.log("Finish button pressed. Notifications enabled:", notificationsEnabled, "College:", collegeInput);
    // Update the college preference in context state before saving all
    updatePreference('college', collegeInput); 
    // Pass the current local state of notificationsEnabled to the save function
    const success = await savePersonalizationPreferences(notificationsEnabled); 
    
    if (success) {
      console.log("Personalization preferences saved successfully.");
      // Navigation is handled by AppNavigator reacting to personalizationCompleted state change
    } else {
      console.log("Failed to save personalization preferences.");
      // Error alert is likely shown from AppContext, but you can add more specific UI feedback here if needed.
    }
  };

  const toggleSwitch = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  return (
    <OnboardingWrapper title="Stay Updated" subtitle="Customize your final preferences.">
      <View style={styles.settingItem}>
        <Text style={styles.label}>Receive Notifications</Text>
        <Switch
          trackColor={{ false: COLORS.inactiveDot, true: COLORS.primaryDark }}
          thumbColor={notificationsEnabled ? COLORS.primary : COLORS.mediumGray}
          ios_backgroundColor={COLORS.lightBorder}
          onValueChange={toggleSwitch}
          value={notificationsEnabled}
        />
      </View>
      
      <Text style={styles.labelOptional}>College (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., MIT Muzaffarpur"
        value={collegeInput}
        onChangeText={setCollegeInput} // Update local state
        placeholderTextColor={COLORS.textSecondary}
      />
      
      <View style={styles.buttonWrapper}>
        <NextButton title="Finish Setup" onPress={handleFinish} loading={loading} />
      </View>
      <Text style={styles.infoText}>
        You can change these preferences later in the app settings.
      </Text>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  settingItem: { // Renamed from switchContainer for generality
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderColor: COLORS.lightBorder,
    borderWidth: 1,
    marginBottom: 20, // Consistent margin
  },
  label: {
    fontSize: 16,
    color: COLORS.textTitle,
    fontWeight: '500',
  },
  labelOptional: {
    fontSize: 16,
    color: COLORS.textTitle,
    marginBottom: 8,
    fontWeight: '500',
    width: '100%',
    marginTop: 10, // Added some top margin
  },
  input: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    color: COLORS.textTitle,
    width: '100%',
    marginBottom: 25,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: {
    marginTop: 20,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 10, // Adjusted margin
    alignItems: 'center',
  }
});

export default NotificationSettingsScreen;