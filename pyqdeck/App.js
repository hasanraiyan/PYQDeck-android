// App.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen'; // We'll create this
import { AppTheme } from './src/constants/theme';
import { ONBOARDING_COMPLETED_KEY, APP_VERSION } from './src/constants/appConstants';
import { playHaptic } from './src/utils/haptics';


SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { userToken, isLoading: authIsLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(null); // null, true, or false
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setShowOnboarding(onboardingCompleted !== 'true');
      } catch (e) {
        console.warn("App.js: Error checking onboarding status", e);
        setShowOnboarding(true); // Default to show onboarding on error
      } finally {
        // We wait for both onboarding check and auth token resolution
        if (!authIsLoading) {
            setAppIsReady(true);
        }
      }
    }
    prepareApp();
  }, [authIsLoading]); // Re-check when authIsLoading changes


  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && showOnboarding !== null) { // Ensure all checks are done
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, showOnboarding]);


  const handleCompleteOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setShowOnboarding(false);
      playHaptic('success');
    } catch (e) {
      console.warn("App.js: Error saving onboarding status", e);
    }
  };

  if (!appIsReady || showOnboarding === null || authIsLoading) {
    return (
      <View style={styles.loadingContainer} onLayout={onLayoutRootView}>
        {/* Keep splash screen visible, or show a minimal loader */}
        {/* <ActivityIndicator size="large" color={AppTheme.colors.lightText} />
        <Text style={styles.loadingText}>Launching PYQDeck {APP_VERSION}...</Text> */}
      </View>
    );
  }
  
  // Ensure onLayoutRootView is called once when the main content is ready to be shown
  // This is important because if we return null above, onLayout might not be called on the correct view.
  const mainContent = showOnboarding ? (
    <OnboardingScreen onComplete={handleCompleteOnboarding} />
  ) : (
    <RootNavigator isAuthenticated={!!userToken} />
  );

  return (
    <View style={{flex: 1}} onLayout={onLayoutRootView}>
        {mainContent}
    </View>
  );
};


export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={AppTheme}>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.primaryDark, // Or your splash screen color
  },
  loadingText: {
    color: AppTheme.colors.lightText,
    marginTop: AppTheme.spacing.md,
    fontSize: AppTheme.typography.bodySize,
    fontFamily: AppTheme.typography.fontMedium,
  },
});