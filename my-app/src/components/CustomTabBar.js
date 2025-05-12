// Choice 1: Subtle Bottom Underline

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
const TABS = [
  {
    name: 'Home',
    label: 'Home',
    icon: 'home-variant',
  },
  {
    name: 'Library',
    label: 'Library',
    icon: 'book-open-variant',
  },
  {
    name: 'Saved',
    label: 'Saved',
    icon: 'heart-outline',
  },
  {
    name: 'Profile',
    label: 'Profile',
    icon: 'account-circle-outline',
  },
];

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabInfo = TABS.find(tab => tab.name === route.name);
        if (!tabInfo) return null; // Skip if no matching tab config

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tabInfo.label || descriptors[route.key]?.options?.tabBarAccessibilityLabel}
            testID={descriptors[route.key]?.options?.tabBarTestID}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.85}
          >
            <View style={styles.tabContent}>
                <MaterialCommunityIcons
                name={tabInfo.icon}
                color={isFocused ? COLORS.primary : '#7c879e'}
                size={26}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                {tabInfo.label}
                </Text>
            </View>
            {/* Active Indicator - Underline */}
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopColor: '#eaeaea',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative', // Needed for indicator positioning
  },
  tabContent: {
      alignItems: 'center',
      justifyContent: 'center',
  },
  activeIndicator: {
      position: 'absolute',
      bottom: 0, // Position at the bottom
      width: '70%', // Indicator width
      height: 3, // Indicator thickness
      backgroundColor: COLORS.primary, // Solid active color
      borderRadius: 2, // Slightly rounded ends
  },
  label: {
    fontSize: 11,
    color: '#7c879e',
    marginTop: 3,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});