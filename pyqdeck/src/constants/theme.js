// src/constants/theme.js
import { DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';
import tinycolor from 'tinycolor2'; // Ensure tinycolor2 is a dependency

export const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#673AB7', // Deep Purple
    primaryLight: '#9575CD', // Lighter Purple
    primaryDark: '#512DA8', // Darker Purple
    accent: '#FFC107', // Amber
    accentLight: '#FFD54F', // Lighter Amber
    background: '#F8F9FE', // Very light grey-blue, almost white
    card: '#FFFFFF', // White
    text: '#1A202C', // Dark grey - almost black (Charcoal)
    textSecondary: '#4A5568', // Medium grey (Slate)
    placeholder: '#A0AEC0', // Light grey (Cool Gray)
    border: '#E2E8F0', // Very light grey (Cloudy Blue)
    divider: '#F1F5F9', // Even lighter grey (Ghost White)
    success: '#34D399', // Emerald Green
    danger: '#F87171', // Light Red
    warning: '#FBBF24', // Bright Yellow/Orange
    info: '#60A5FA', // Sky Blue
    lightText: '#FFFFFF', // White
    gradientStart: '#7C3AED', // Vibrant Purple (for primary buttons)
    gradientEnd: '#5B21B6',   // Deeper Vibrant Purple (for primary buttons)
    skeletonBase: '#E5E7EB', // Light Gray for skeleton
    skeletonHighlight: '#F9FAFB', // Off-white for skeleton highlight
    softShadow: 'rgba(45, 55, 72, 0.08)',
    mediumShadow: 'rgba(45, 55, 72, 0.12)',
    strongShadow: 'rgba(45, 55, 72, 0.18)',
    overlay: 'rgba(0, 0, 0, 0.65)', // Dark overlay
    gradientAccentStart: '#FFD54F', // Lighter Amber
    gradientAccentEnd: '#FFC107',   // Amber
    statusNotStarted: '#A0AEC0', // Light grey (Placeholder)
    statusPracticed: '#60A5FA', // Sky Blue (Info)
    statusMastered: '#34D399', // Emerald Green (Success)
    frostedBackground: Platform.OS === 'ios' ? 'rgba(250, 250, 255, 0.85)' : 'rgba(250, 250, 255, 0.95)',
    frostedBorder: 'rgba(200, 200, 220, 0.3)',
  },
  typography: {
    h1Size: 30,
    h2Size: 26,
    h3Size: 22,
    h4Size: 19,
    bodySize: 16,
    bodySmall: 14,
    captionSize: 12,
    fontBold: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-black',
    fontMedium: Platform.OS === 'ios' ? 'HelveticaNeue-Medium' : 'sans-serif-medium',
    fontRegular: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif',
    fontLight: Platform.OS === 'ios' ? 'HelveticaNeue-Light' : 'sans-serif-light',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
    circle: 999,
  }
};

// Helper function to use tinycolor if needed within the theme (or elsewhere)
export const tc = (color) => tinycolor(color);