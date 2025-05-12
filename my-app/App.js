import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import OnboardingStack from './src/navigation/OnboardingStack';
import PersonalizationOnboardingNavigator from './src/navigation/PersonalizationOnboardingNavigator';
import { ActivityIndicator, View } from 'react-native';
import GlobalErrorBoundary from './src/components/GlobalErrorBoundary';

function RootNavigation() {
  const { currentUser, token, logoutCount, initialAuthLoading } = useAuth();
  const { onboardingCompleted, personalizationCompleted, initialAppLoading } = useApp();

  // Show a loading spinner while checking token/auth or app state
  if (initialAuthLoading || initialAppLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4834d4" />
      </View>
    );
  }

  let Navigator = null;
  if (!onboardingCompleted) {
    Navigator = <OnboardingStack />;
  } else if (!currentUser || !token) {
    Navigator = <AuthNavigator />;
  } else if (!personalizationCompleted) {
    Navigator = <PersonalizationOnboardingNavigator />;
  } else {
    Navigator = <AppNavigator />;
  }

  return (
    <GlobalErrorBoundary>
      <NavigationContainer>
        {Navigator}
      </NavigationContainer>
    </GlobalErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RootNavigation />
      </AppProvider>
    </AuthProvider>
  );
}
