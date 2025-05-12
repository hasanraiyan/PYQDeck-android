import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BranchScreen from '../screens/onboarding/BranchScreen';
import SemesterScreen from '../screens/onboarding/SemesterScreen';
import PreferencesScreen from '../screens/onboarding/PreferencesScreen';
import NotificationSettingsScreen from '../screens/onboarding/NotificationSettingsScreen';
import { COLORS } from '../constants/Colors'; // Adjust path

const Stack = createStackNavigator();

const PersonalizationOnboardingNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Branch"
      screenOptions={{
        headerShown: true, // Show headers for back navigation if needed
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: COLORS.textTitle,
        },
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen 
        name="Branch" 
        component={BranchScreen} 
        options={{ title: 'Select Your Branch' }} 
      />
      <Stack.Screen 
        name="Semester" 
        component={SemesterScreen} 
        options={{ title: 'Select Your Semester' }} 
      />
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen} 
        options={{ title: 'Your Learning Style' }} 
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Stay Updated' }}
      />
    </Stack.Navigator>
  );
};

export default PersonalizationOnboardingNavigator;