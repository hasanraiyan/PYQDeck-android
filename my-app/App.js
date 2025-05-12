import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext'; // Import useAuth
import AppNavigator from './src/navigation/AppNavigator';

// A new component to consume logoutCount and apply it as a key
const AppWithKeyedProvider = () => {
  const { logoutCount } = useAuth();

  return (
    <AppProvider key={logoutCount.toString()}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppWithKeyedProvider />
    </AuthProvider>
  );
}