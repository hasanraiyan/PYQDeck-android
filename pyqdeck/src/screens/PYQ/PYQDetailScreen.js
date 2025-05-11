// src/screens/PYQ/PYQDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AppTheme } from '../../constants/theme';

const PYQDetailScreen = ({ route }) => {
  const { question } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>
      
      <View style={styles.solutionContainer}>
        <Text style={styles.sectionTitle}>Solution</Text>
        <Text style={styles.solutionText}>{question.solution}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.background,
  },
  questionContainer: {
    marginBottom: AppTheme.spacing.xl,
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
  },
  questionText: {
    fontSize: AppTheme.typography.bodySize,
    color: AppTheme.colors.text,
    lineHeight: AppTheme.typography.bodySize * 1.5,
  },
  solutionContainer: {
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
  },
  sectionTitle: {
    fontSize: AppTheme.typography.h3Size,
    fontFamily: AppTheme.typography.fontBold,
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.md,
  },
  solutionText: {
    fontSize: AppTheme.typography.bodySize,
    color: AppTheme.colors.text,
    lineHeight: AppTheme.typography.bodySize * 1.5,
  },
});

export default PYQDetailScreen;