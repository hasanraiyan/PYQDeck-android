// my-app/src/screens/onboarding/NotificationSettingsScreen.js
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert, Dimensions, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
      <View style={styles.card}>
        <View style={styles.settingItem}>
          <MaterialCommunityIcons name="bell-ring-outline" size={24} color={COLORS.primaryDark} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Receive Notifications</Text>
            <Text style={styles.helpText}>Get important updates, reminders, and news.</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.inactiveDot, true: COLORS.primaryDark }}
            thumbColor={notificationsEnabled ? COLORS.primary : COLORS.mediumGray}
            ios_backgroundColor={COLORS.lightBorder}
            onValueChange={toggleSwitch}
            value={notificationsEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <MaterialCommunityIcons name="school-outline" size={24} color={COLORS.primaryDark} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>College <Text style={{ color: COLORS.textSecondary, fontWeight: '400' }}>(Optional)</Text></Text>
            <Text style={styles.helpText}>Enter your institute name for more personalized experience.</Text>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="e.g., MIT Muzaffarpur"
          value={collegeInput}
          onChangeText={setCollegeInput} // Update local state
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

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
  card: {
    width: '100%',
    backgroundColor: COLORS.white,

    padding: 15,
    marginBottom: 22,
    alignSelf: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    gap: 10,
  },
  icon: {
    marginRight: 13,
    minWidth: 28,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
  label: {
    fontSize: 18,
    color: COLORS.textTitle,
    fontWeight: '600',
    marginBottom: 2,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 1,
  },
  input: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 17,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    color: COLORS.textTitle,
    width: '100%',
    marginBottom: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 32,
    alignItems: 'center',
  }
});

export default NotificationSettingsScreen;
