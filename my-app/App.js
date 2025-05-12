import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import PersonalizationOnboardingNavigator from './src/navigation/PersonalizationOnboardingNavigator';

function RootNavigation() {
  const { currentUser, token, logoutCount, initialAuthLoading, onboardingCompleted } = useAuth();

  // Optionally, show a splash/loader while checking token
  if (initialAuthLoading) {
    // Could render a splash screen or null
    return null;
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
      <NavigationContainer>
        {Navigator}
      </NavigationContainer>
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
