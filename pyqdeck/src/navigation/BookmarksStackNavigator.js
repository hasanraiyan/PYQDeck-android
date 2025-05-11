// src/navigation/BookmarksStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BookmarksScreen from '../screens/Bookmarks/BookmarksScreen'; // We'll create this
import PYQDetailScreen from '../screens/PYQ/PYQDetailScreen'; // We'll create this
import { commonScreenOptions } from './navigationConfig';

const Stack = createStackNavigator();

const BookmarksStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="BookmarksScreenContainer" component={BookmarksScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PYQDetailScreenFromBookmark" component={PYQDetailScreen} options={{ title: "Bookmarked PYQ" }} />
  </Stack.Navigator>
);
export default BookmarksStackNavigator;