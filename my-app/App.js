import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import OnboardingStack from './src/navigation/OnboardingStack';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NavigationContainer>
          <OnboardingStack />
        </NavigationContainer>
      </AppProvider>
    </AuthProvider>
  );
}