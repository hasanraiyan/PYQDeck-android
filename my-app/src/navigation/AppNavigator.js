import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubjectDetailScreen from '../screens/SubjectDetailScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BrowseQuestionsScreen from '../screens/BrowseQuestionsScreen';
import QuestionsListScreen from '../screens/QuestionsListScreen';

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
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#3479f6',
        tabBarInactiveTintColor: '#7c879e',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 13 },
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-variant';
          else if (route.name === 'Library') iconName = 'book-open-variant';
          else if (route.name === 'Saved') iconName = 'heart-outline';
          else if (route.name === 'Profile') iconName = 'account-circle-outline';
          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
