import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Sample data for demonstration
const sampleBookmarks = [
  { id: '1', title: 'Data Structures Mid Term 2023', course: 'Data Structures', date: '10/15/2023' },
  { id: '2', title: 'Algorithms Final 2022', course: 'Algorithms', date: '12/05/2022' },
  { id: '3', title: 'OS Concepts Quiz 2023', course: 'Operating Systems', date: '09/20/2023' },
];

const BookmarksScreen = () => {
  const renderBookmarkItem = ({ item }) => (
    <TouchableOpacity style={styles.bookmarkItem}>
      <View style={styles.bookmarkContent}>
        <Text style={styles.bookmarkTitle}>{item.title}</Text>
        <View style={styles.bookmarkMeta}>
          <Text style={styles.bookmarkCourse}>{item.course}</Text>
          <Text style={styles.bookmarkDate}>Saved on {item.date}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton}>
        <Ionicons name="bookmark" size={24} color="#4285F4" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Bookmarks</Text>
      
      {sampleBookmarks.length > 0 ? (
        <FlatList
          data={sampleBookmarks}
          renderItem={renderBookmarkItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.bookmarksList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No bookmarks yet</Text>
          <Text style={styles.emptySubtext}>Save your favorite PYQs for quick access</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#333',
  },
  bookmarksList: {
    paddingBottom: 20,
  },
  bookmarkItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookmarkContent: {
    flex: 1,
    marginRight: 10,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  bookmarkMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookmarkCourse: {
    fontSize: 14,
    color: '#666',
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default BookmarksScreen;