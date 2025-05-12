import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {
  const { logout } = useAuth();
  const { clearSelections, setOnboardingCompleted, userPreferences, personalizationCompleted, updatePreference } = useApp();

  // Resets onboarding/personalization context to defaults before logout.
  const handleLogout = async () => {
    // Clear all AppContext selections/state (in-memory)
    if (clearSelections) clearSelections();
    if (setOnboardingCompleted) setOnboardingCompleted(false);

    // Reset preferences to defaults ("userPreferences" keys defined in AppContext.js)
    if (updatePreference) {
      updatePreference('branch', null);
      updatePreference('semester', null);
      updatePreference('college', '');
      updatePreference('goal', null);
      updatePreference('frequency', null);
      updatePreference('preferredContent', null);
      updatePreference('notificationsEnabled', true);
      updatePreference('language', 'English');
    }

    // Ensure future flags
    // (No direct setter for personalizationCompleted, but will reload as false from storage after AsyncStorage.clear())
    // Finally, perform full logout
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to PYQ Deck!</Text>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        activeOpacity={0.85}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingTop: 40,
  },
  header: {
    width: '100%',
    padding: 20,
    backgroundColor: '#0984e3',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  content: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 24,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 36,
    backgroundColor: '#e17055',
    paddingVertical: 13,
    paddingHorizontal: 45,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#e17055',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
});
