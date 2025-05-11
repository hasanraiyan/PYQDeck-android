import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import OnboardingStack from './OnboardingStack';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { currentUser, loading: authLoading } = useAuth(); // Renamed for clarity
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [isAppInitializing, setIsAppInitializing] = useState(true); // New state

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingCompleted');
        setOnboardingCompleted(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingCompleted(false); // Default to false on error to ensure a path is chosen
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // This effect determines if the application's very initial setup is complete.
    // It sets isAppInitializing to false once both initial checks (onboarding and auth) are done.
    if (isAppInitializing && !checkingOnboarding && !authLoading) {
      setIsAppInitializing(false);
    }
  }, [isAppInitializing, checkingOnboarding, authLoading]);

  if (isAppInitializing) {
    // Show a loading screen (or null) only during the app's true initialization phase.
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
