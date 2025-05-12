import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';
import OnboardingWrapper from '../../components/onboarding/OnboardingWrapper';
import NextButton from '../../components/onboarding/NextButton';
import { COLORS } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const NotificationSettingsScreen = ({ navigation }) => {
  const { updatePreference, savePersonalizationPreferences, userPreferences, loading } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(userPreferences.notificationsEnabled);

  const handleFinish = async () => {
    updatePreference('notificationsEnabled', notificationsEnabled);
    await savePersonalizationPreferences();
    console.log('Personalization preferences saved:', userPreferences);
    // Navigation will be handled by AppNavigator reacting to personalizationCompleted
  };

  const toggleSwitch = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  return (
    <OnboardingWrapper title="Stay Updated" subtitle="Enable notifications for exam alerts and new PYQ pings.">
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Receive Notifications</Text>
        <Switch
          trackColor={{ false: COLORS.inactiveDot, true: COLORS.primaryDark }}
          thumbColor={notificationsEnabled ? COLORS.primary : COLORS.mediumGray}
          ios_backgroundColor={COLORS.lightBorder}
          onValueChange={toggleSwitch}
          value={notificationsEnabled}
        />
      </View>
      
      {/* Optional: College Input - Can be added here or as a separate step if important */}
      {/* 
      <Text style={styles.labelOptional}>College (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., MIT Muzaffarpur"
        value={userPreferences.college || ''}
        onChangeText={(text) => updatePreference('college', text)}
        placeholderTextColor={COLORS.textSecondary}
      />
      */}

      <NextButton title="Finish Setup" onPress={handleFinish} loading={loading} />
      <Text style={styles.infoText}>
        You can change these preferences later in the app settings.
      </Text>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
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
    marginBottom: 25,
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
    marginTop: 20,
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
  },
  infoText: {
    marginTop: 20,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationSettingsScreen;
