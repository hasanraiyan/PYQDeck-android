// src/components/common/ScreenHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../constants/theme';
import { playHaptic } from '../../utils/haptics';

const ScreenHeader = ({
  title,
  onBackPress,
  rightAction, // { onPress: function, iconName: string, iconSize?: number, iconColor?: string }
  transparent = false,
  headerStyleOverride,
}) => {
  return (
    <View
      style={[
        styles.screenHeader_container,
        transparent && styles.screenHeader_transparent,
        headerStyleOverride,
      ]}
    >
      {onBackPress ? (
        <TouchableOpacity
          onPress={() => {
            playHaptic();
            onBackPress();
          }}
          style={styles.screenHeader_backButton}
        >
          <Ionicons
            name="arrow-back-outline"
            size={28}
            color={transparent ? AppTheme.colors.primary : AppTheme.colors.lightText}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} /> // Placeholder for alignment
      )}
      <Text
        style={[
          styles.screenHeader_title,
          transparent && { color: AppTheme.colors.primaryDark },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {rightAction ? (
        <TouchableOpacity
          onPress={() => {
            playHaptic();
            rightAction.onPress();
          }}
          style={styles.screenHeader_rightAction}
        >
          <Ionicons
            name={rightAction.iconName}
            size={rightAction.iconSize || 26}
            color={rightAction.iconColor || (transparent ? AppTheme.colors.primary : AppTheme.colors.lightText)}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} /> // Placeholder for alignment
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenHeader_container: {
    height: Platform.OS === 'ios' ? 100 : 60 + (RNStatusBar.currentHeight || 0), // Adjust as needed
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppTheme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 45 : RNStatusBar.currentHeight,
    paddingHorizontal: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.primaryDark + '33',
    elevation: 3,
  },
  screenHeader_transparent: {
    backgroundColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : (RNStatusBar.currentHeight || 0) + AppTheme.spacing.sm,
  },
  screenHeader_backButton: {
    padding: AppTheme.spacing.sm,
    marginLeft: -AppTheme.spacing.sm, // To make touch area larger
  },
  screenHeader_title: {
    fontSize: AppTheme.typography.h4Size,
    fontFamily: AppTheme.typography.fontBold,
    color: AppTheme.colors.lightText,
    textAlign: 'center',
    flex: 1, // Allows title to take available space and center correctly
    marginHorizontal: AppTheme.spacing.sm, // Ensure title doesn't overlap buttons
    letterSpacing: 0.3,
  },
  screenHeader_rightAction: {
    padding: AppTheme.spacing.sm,
    marginRight: -AppTheme.spacing.sm, // To make touch area larger
  },
});

export default ScreenHeader;