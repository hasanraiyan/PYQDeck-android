// src/navigation/SettingsStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/Settings/SettingsScreen'; // We'll create this
import { commonScreenOptions } from './navigationConfig';

const Stack = createStackNavigator();

const SettingsStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);
export default SettingsStackNavigator;