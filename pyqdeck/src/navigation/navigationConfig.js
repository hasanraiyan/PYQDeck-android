// src/navigation/navigationConfig.js
import { AppTheme } from '../constants/theme';
import { Platform } from 'react-native';

export const commonScreenOptions = {
  headerStyle: {
    backgroundColor: AppTheme.colors.primary,
    elevation: Platform.OS === 'android' ? 5 : 2,
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.25,
    shadowOffset: { height: Platform.OS === 'ios' ? 2 : 1, width: 0 },
    shadowColor: AppTheme.colors.primaryDark,
    borderBottomWidth: Platform.OS === 'ios' ? 0 : 0.5,
    borderBottomColor: AppTheme.colors.primaryLight + '77',
  },
  headerTintColor: AppTheme.colors.lightText,
  headerTitleStyle: {
    fontFamily: AppTheme.typography.fontBold,
    fontSize: AppTheme.typography.h4Size,
    letterSpacing: 0.2,
  },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: AppTheme.colors.background },
  headerTitleAlign: 'center',
};