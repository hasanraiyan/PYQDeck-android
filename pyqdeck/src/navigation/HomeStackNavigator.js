// src/navigation/HomeStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Home/HomeScreen'; // We'll create this
import SubjectDetailScreen from '../screens/Home/SubjectDetailScreen'; // We'll create this
import PYQDetailScreen from '../screens/PYQ/PYQDetailScreen'; // We'll create this
import { commonScreenOptions } from './navigationConfig'; // Import common options from shared config

const Stack = createStackNavigator();

const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SubjectDetailScreen" component={SubjectDetailScreen} />
    <Stack.Screen name="PYQDetailScreen" component={PYQDetailScreen} />
  </Stack.Navigator>
);
export default HomeStackNavigator;