// my-app/src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import OnboardingStack from './OnboardingStack'; // This is for the initial feature showcase
import { useApp } from '../context/AppContext';
import PersonalizationOnboardingNavigator from './PersonalizationOnboardingNavigator'; // NEW

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { currentUser, initialAuthLoading } = useAuth();
  const { onboardingCompleted, personalizationCompleted, initialAppLoading: appInitialLoading } = useApp();

  if (initialAuthLoading || appInitialLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingCompleted ? (
        <Stack.Screen name="FeatureOnboarding" component={OnboardingStack} />
      ) : !currentUser ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !personalizationCompleted ? ( // This is the key condition
        <Stack.Screen name="PersonalizationOnboarding" component={PersonalizationOnboardingNavigator} />
      ) : ( // currentUser must exist and personalizationCompleted is true
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;