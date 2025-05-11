import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  primary = true,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.buttonText,
          primary ? styles.primaryButtonText : styles.secondaryButtonText,
          disabled && styles.disabledButtonText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.spacing,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    borderColor: COLORS.gray,
  },
  buttonText: {
    fontSize: SIZES.large,
    ...FONTS.medium,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  disabledButtonText: {
    color: COLORS.lightGray,
  },
});

export default Button;