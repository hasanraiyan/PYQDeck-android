// src/components/common/PrimaryButton.js
import React, { useRef } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tinycolor from 'tinycolor2';

import { AppTheme } from '../../constants/theme';
import { playHaptic } from '../../utils/haptics';

const PrimaryButton = ({
  title,
  onPress,
  iconName,
  style,
  textStyle,
  disabled,
  isLoading,
  variant = 'primary', // 'primary', 'danger', 'success'
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  const gradientColors = disabled
    ? [AppTheme.colors.placeholder, tinycolor(AppTheme.colors.placeholder).darken(10).toString()]
    : variant === 'danger'
    ? [AppTheme.colors.danger, tinycolor(AppTheme.colors.danger).darken(15).toString()]
    : variant === 'success'
    ? [AppTheme.colors.success, tinycolor(AppTheme.colors.success).darken(15).toString()]
    : [AppTheme.colors.gradientStart, AppTheme.colors.gradientEnd];

  let buttonPaddingVertical = AppTheme.spacing.md;
  let iconSizeVal = 22;
  let textSizeVal = AppTheme.typography.bodySize;

  if (size === 'small') {
    buttonPaddingVertical = AppTheme.spacing.sm + 2; // Adjusted for typical small button feel
    iconSizeVal = 18;
    textSizeVal = AppTheme.typography.bodySmall;
  } else if (size === 'large') {
    buttonPaddingVertical = AppTheme.spacing.md + AppTheme.spacing.xs; // Adjusted
    iconSizeVal = 24;
    textSizeVal = AppTheme.typography.h4Size - 1;
  }

  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (!disabled && !isLoading && onPress) {
      Animated.spring(scaleValue, {
        toValue: 0.96,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const onPressOut = () => {
    if (!disabled && !isLoading && onPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (onPress && !disabled && !isLoading) {
      playHaptic('medium');
      onPress();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        style={[styles.primaryButtonGlobal, style, disabled && styles.primaryButtonDisabledGlobal]}
        activeOpacity={1} // Handled by animation
        disabled={disabled || isLoading}
      >
        <LinearGradient
          colors={gradientColors}
          style={[
            styles.primaryButtonGradientGlobal,
            { paddingVertical: buttonPaddingVertical }
          ]}
        >
          {isLoading ? (
            <ActivityIndicator
              color={AppTheme.colors.lightText}
              size={size === 'small' ? "small" : "small"} // RN uses 'small' or 'large'
              style={{ marginRight: iconName ? AppTheme.spacing.sm : 0 }}
            />
          ) : (
            iconName && (
              <Ionicons
                name={iconName}
                size={iconSizeVal}
                color={AppTheme.colors.lightText}
                style={{ marginRight: AppTheme.spacing.sm }}
              />
            )
          )}
          <Text style={[styles.primaryButtonTextGlobal, textStyle, { fontSize: textSizeVal }]}>
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  primaryButtonGlobal: {
    borderRadius: AppTheme.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: AppTheme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButtonDisabledGlobal: {
    opacity: 0.65,
  },
  primaryButtonGradientGlobal: {
    // paddingVertical is dynamic based on 'size' prop
    paddingHorizontal: AppTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButtonTextGlobal: {
    color: AppTheme.colors.lightText,
    fontFamily: AppTheme.typography.fontBold,
    letterSpacing: 0.5,
  },
});

export default PrimaryButton;