import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubjectDetailScreen from '../screens/Home/SubjectDetailScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BrowseQuestionsScreen from '../screens/Home/BrowseQuestionsScreen';
import CustomTabBar from '../components/CustomTabBar';
import QuestionsListScreen from '../screens/Home/QuestionsListScreen';

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
      <HomeStack.Screen name="BrowseQuestions" component={BrowseQuestionsScreen} />
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
