// src/components/common/ThemedStatusBar.js
import React from 'react';
import { StatusBar as RNStatusBar, Platform } from 'react-native';
import { AppTheme } from '../../constants/theme'; // Correct path

const ThemedStatusBar = ({
  backgroundColor = AppTheme.colors.primaryDark,
  barStyle = Platform.OS === "ios" ? "dark-content" : "light-content",
  translucent = Platform.OS === 'android' ? true : false,
} = {}) => (
  <RNStatusBar
    barStyle={barStyle}
    backgroundColor={backgroundColor}
    translucent={translucent}
  />
);

export default ThemedStatusBar;