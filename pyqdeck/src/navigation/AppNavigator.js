// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native'; // For placeholder screens
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '../constants/theme';

// Import Screens (placeholders for now, will be replaced)
// Auth Screens
import WelcomeAuthScreen from '../screens/Auth/WelcomeAuthScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// Main App Stacks (we'll define these in separate files later for clarity)
import HomeStackNavigator from './HomeStackNavigator';
import SearchStackNavigator from './SearchStackNavigator';
import BookmarksStackNavigator from './BookmarksStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Import common screen options from shared config
import { commonScreenOptions } from './navigationConfig';


// Authentication Stack
const AuthStackNav = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animationTypeForReplace: 'push' }}>
    <Stack.Screen name="WelcomeAuthScreen" component={WelcomeAuthScreen} />
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="SignupScreen" component={SignupScreen} />
  </Stack.Navigator>
);

// Main Application Tabs
const AppTabsNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        size = focused ? 26 : 23;
        if (route.name === 'HomeTab') iconName = focused ? 'home-sharp' : 'home-outline';
        else if (route.name === 'SearchTab') iconName = focused ? 'search-sharp' : 'search-outline';
        else if (route.name === 'BookmarksTab') iconName = focused ? 'bookmarks-sharp' : 'bookmarks-outline';
        else if (route.name === 'SettingsTab') iconName = focused ? 'settings-sharp' : 'settings-outline';
        return (
          <View style={[styles.tabBarIconContainer, focused && styles.tabBarIconContainerFocused]}>
            <Ionicons name={iconName} size={size} color={color} />
            {focused && <View style={styles.tabBarActiveIndicator} />}
          </View>
        );
      },
      tabBarActiveTintColor: AppTheme.colors.primary,
      tabBarInactiveTintColor: AppTheme.colors.textSecondary,
      headerShown: false,
      tabBarStyle: styles.tabBarStyle,
      tabBarLabelStyle: styles.tabBarLabelStyle,
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="SearchTab" component={SearchStackNavigator} options={{ title: 'Discover' }} />
    <Tab.Screen name="BookmarksTab" component={BookmarksStackNavigator} options={{ title: 'Saved' }} />
    <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

// Root Navigator that decides between Auth and Main App
const RootNavigator = ({ isAuthenticated }) => {
  if (isAuthenticated === null) {
    // This case should ideally be handled by a loading screen in App.js
    return null; 
  }
  return isAuthenticated ? <AppTabsNavigator /> : <AuthStackNav />;
};

export default RootNavigator;


const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: AppTheme.colors.card,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.divider,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingTop: AppTheme.spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? AppTheme.spacing.lg - AppTheme.spacing.xs : AppTheme.spacing.xs,
    elevation: 15,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowColor: AppTheme.colors.mediumShadow,
  },
  tabBarLabelStyle: {
    fontFamily: AppTheme.typography.fontMedium,
    fontSize: AppTheme.typography.captionSize - 1,
    letterSpacing: 0.1,
    marginBottom: Platform.OS === 'ios' ? -AppTheme.spacing.xs : 0,
  },
  tabBarIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    paddingTop: AppTheme.spacing.xs,
  },
  tabBarIconContainerFocused: {
    // Add any specific styles for focused icon container if needed
  },
  tabBarActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: 3,
    backgroundColor: AppTheme.colors.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});