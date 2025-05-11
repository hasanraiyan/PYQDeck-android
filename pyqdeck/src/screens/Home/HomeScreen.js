import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';

// Sample data for demonstration
const sampleCourses = [
  { id: '1', title: 'Data Structures', count: 120 },
  { id: '2', title: 'Algorithms', count: 85 },
  { id: '3', title: 'Operating Systems', count: 95 },
  { id: '4', title: 'Database Management', count: 75 },
];

const sampleRecentPYQs = [
  { id: '1', title: 'Data Structures Mid Term 2023', course: 'Data Structures' },
  { id: '2', title: 'Algorithms Final 2022', course: 'Algorithms' },
  { id: '3', title: 'OS Concepts Quiz 2023', course: 'Operating Systems' },
];

const HomeScreen = () => {
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity style={styles.courseItem}>
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseCount}>{item.count} PYQs</Text>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity style={styles.recentItem}>
      <Text style={styles.recentTitle}>{item.title}</Text>
      <Text style={styles.recentCourse}>{item.course}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Student!</Text>
        <Text style={styles.subGreeting}>Ready to practice?</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Courses</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={sampleCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent PYQs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={sampleRecentPYQs}
          renderItem={renderRecentItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#4285F4',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#4285F4',
    fontWeight: '500',
  },
  courseItem: {
    width: 150,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  courseCount: {
    fontSize: 14,
    color: '#666',
  },
  recentItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recentCourse: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;