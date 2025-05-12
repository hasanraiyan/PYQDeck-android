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
  // Added personalizationCompleted and initialAppLoading from AppContext
  const { onboardingCompleted, personalizationCompleted, initialAppLoading: appInitialLoading } = useApp(); 

  // Loading screen for both context initializations
  if (initialAuthLoading || appInitialLoading) {
    // You might want to return a dedicated global loading component here
    // For now, null is fine as per existing behavior for initialAuthLoading
    return null; 
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingCompleted ? (
        // 1. Initial Feature Showcase Onboarding (existing)
        // If the user hasn't completed the general app onboarding, show this first.
        <Stack.Screen name="FeatureOnboarding" component={OnboardingStack} />
      ) : !currentUser ? (
        // 2. Auth flow
        // If feature onboarding is done but user is not logged in, show AuthNavigator.
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !personalizationCompleted ? (
        // 3. Post-Login Personalization Onboarding (NEW)
        // If feature onboarding is done, user is logged in, but personalization is not complete.
        <Stack.Screen name="PersonalizationOnboarding" component={PersonalizationOnboardingNavigator} />
      ) : currentUser ? (
        // 4. Authenticated and all onboarding done stack
        // If all onboarding is complete and user is logged in, show HomeScreen.
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
          {/* Add other authenticated screens here if needed */}
        </Stack.Group>
      ) : (
        // 5. Fallback to Auth stack (should ideally not be reached if logic above is complete)
        // This primarily acts as a safeguard.
        <Stack.Screen name="AuthFallback" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;