// FILE: my-app/src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubjectDetailScreen from '../screens/Home/SubjectDetailScreen';
import CustomTabBar from '../components/CustomTabBar';
import QuestionsListScreen from '../screens/Home/QuestionsListScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Ensure this is imported

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <HomeStack.Screen name="HomeFeed" component={HomeScreen} />
      <HomeStack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
      <HomeStack.Screen name="QuestionsList" component={QuestionsListScreen} />
      {/* Additional screens as needed */}
    </HomeStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}