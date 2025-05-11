// src/navigation/SearchStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from '../screens/Search/SearchScreen'; // We'll create this
import PYQDetailScreen from '../screens/PYQ/PYQDetailScreen'; // We'll create this
import { commonScreenOptions } from './navigationConfig';

const Stack = createStackNavigator();

const SearchStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PYQDetailScreenFromSearch" component={PYQDetailScreen} options={{ title: "Search Result" }} />
  </Stack.Navigator>
);
export default SearchStackNavigator;