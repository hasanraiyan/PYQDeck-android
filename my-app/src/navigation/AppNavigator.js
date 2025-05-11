import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import OnboardingStack from './OnboardingStack';
import { useApp } from '../context/AppContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { currentUser, initialAuthLoading } = useAuth();
  const { onboardingCompleted } = useApp();

  // Only show the loading screen during initial checks
  if (initialAuthLoading) {
    // You might want to return a dedicated global loading component here instead of null.
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingCompleted ? (
        // Onboarding stack
        <Stack.Screen name="OnboardingFlow" component={OnboardingStack} />
      ) : currentUser ? (
        // Authenticated stack
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Group>
      ) : (
        // Auth stack
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
