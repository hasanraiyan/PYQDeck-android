import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Sample data for demonstration
const sampleQuestion = {
  id: '1',
  title: 'Data Structures Mid Term 2023',
  course: 'Data Structures',
  year: '2023',
  questions: [
    {
      id: 'q1',
      text: 'Explain the difference between Stack and Queue data structures with examples.',
      marks: 10,
      isBookmarked: false,
    },
    {
      id: 'q2',
      text: 'Implement a function to check if a given string is a palindrome using a stack.',
      marks: 15,
      isBookmarked: true,
    },
    {
      id: 'q3',
      text: 'Describe the time complexity for insertion, deletion, and search operations in a Binary Search Tree.',
      marks: 10,
      isBookmarked: false,
    },
  ],
};

const PYQScreen = () => {
  const [currentPYQ, setCurrentPYQ] = useState(sampleQuestion);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(
    currentPYQ.questions.filter(q => q.isBookmarked).map(q => q.id)
  );

  const toggleBookmark = (questionId) => {
    if (bookmarkedQuestions.includes(questionId)) {
      setBookmarkedQuestions(bookmarkedQuestions.filter(id => id !== questionId));
    } else {
      setBookmarkedQuestions([...bookmarkedQuestions, questionId]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentPYQ.title}</Text>
        <View style={styles.metaInfo}>
          <Text style={styles.course}>{currentPYQ.course}</Text>
          <Text style={styles.year}>{currentPYQ.year}</Text>
        </View>
      </View>

      <ScrollView style={styles.questionsContainer}>
        {currentPYQ.questions.map((question, index) => (
          <View key={question.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Question {index + 1}</Text>
              <Text style={styles.marks}>{question.marks} marks</Text>
            </View>
            
            <Text style={styles.questionText}>{question.text}</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleBookmark(question.id)}
              >
                <Ionicons 
                  name={bookmarkedQuestions.includes(question.id) ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={bookmarkedQuestions.includes(question.id) ? "#4285F4" : "#666"} 
                />
                <Text style={styles.actionText}>Bookmark</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#666" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text-outline" size={24} color="#666" />
                <Text style={styles.actionText}>Solutions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  course: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  year: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  questionsContainer: {
    padding: 15,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  marks: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
});

export default PYQScreen;