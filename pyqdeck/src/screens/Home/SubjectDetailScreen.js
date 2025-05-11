// src/screens/Home/SubjectDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AppTheme } from '../../constants/theme';
import PrimaryButton from '../../components/common/PrimaryButton';

const SubjectDetailScreen = ({ route }) => {
  const { subject } = route.params;
  
  // Mock data for related questions
  const relatedQuestions = [
    { id: '1', question: 'What is the first law of thermodynamics?' },
    { id: '2', question: 'Explain the concept of entropy.' },
    { id: '3', question: 'Derive the ideal gas equation.' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject.name}</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{subject.description}</Text>
        
        <Text style={styles.sectionTitle}>Related Questions</Text>
        <FlatList
          data={relatedQuestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.questionItem}>
              <Text style={styles.questionText}>{item.question}</Text>
            </View>
          )}
        />
      </View>
      
      <PrimaryButton 
        title="Start Practice" 
        onPress={() => console.log('Start practice')}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.background,
  },
  title: {
    fontSize: AppTheme.typography.h2Size,
    fontFamily: AppTheme.typography.fontBold,
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.md,
  },
  detailsContainer: {
    flex: 1,
    marginBottom: AppTheme.spacing.lg,
  },
  description: {
    fontSize: AppTheme.typography.bodySize,
    fontFamily: AppTheme.typography.fontRegular,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.xl,
    lineHeight: AppTheme.typography.bodySize * 1.5,
  },
  sectionTitle: {
    fontSize: AppTheme.typography.h4Size,
    fontFamily: AppTheme.typography.fontBold,
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.md,
  },
  questionItem: {
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: AppTheme.spacing.sm,
  },
  questionText: {
    fontSize: AppTheme.typography.bodySize,
    fontFamily: AppTheme.typography.fontRegular,
    color: AppTheme.colors.text,
  },
  button: {
    marginTop: AppTheme.spacing.md,
  },
});

export default SubjectDetailScreen;