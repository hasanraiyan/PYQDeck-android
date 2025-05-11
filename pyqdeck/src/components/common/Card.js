import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.small,
  },
});

export default Card;