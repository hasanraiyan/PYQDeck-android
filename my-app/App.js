import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import PersonalizationOnboardingNavigator from './src/navigation/PersonalizationOnboardingNavigator';
import { ActivityIndicator, View } from 'react-native';
import GlobalErrorBoundary from './src/components/GlobalErrorBoundary';

function RootNavigation() {
  const { currentUser, token, logoutCount, initialAuthLoading, onboardingCompleted } = useAuth();

  // Show a loading spinner while checking token/auth state
  if (initialAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4834d4" />
      </View>
    );
  }

  let Navigator = null;
  if (!currentUser || !token) {
    Navigator = <AuthNavigator />;
  } else if (!onboardingCompleted) {
    Navigator = <PersonalizationOnboardingNavigator />;
  } else {
    Navigator = <AppNavigator />;
  }

  return (
    <AppProvider key={logoutCount.toString()}>
      <GlobalErrorBoundary>
        <NavigationContainer>
          {Navigator}
        </NavigationContainer>
      </GlobalErrorBoundary>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
