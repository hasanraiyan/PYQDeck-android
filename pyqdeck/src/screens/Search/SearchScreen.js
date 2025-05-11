import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Sample data for demonstration
const sampleSearchResults = [
  { id: '1', title: 'Data Structures Mid Term 2023', course: 'Data Structures', year: '2023' },
  { id: '2', title: 'Algorithms Final 2022', course: 'Algorithms', year: '2022' },
  { id: '3', title: 'OS Concepts Quiz 2023', course: 'Operating Systems', year: '2023' },
  { id: '4', title: 'Database Management Systems', course: 'DBMS', year: '2022' },
  { id: '5', title: 'Computer Networks Final', course: 'Networks', year: '2021' },
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setResults([]);
      return;
    }
    
    // Filter the sample data based on search query
    const filteredResults = sampleSearchResults.filter(
      item => item.title.toLowerCase().includes(text.toLowerCase()) ||
             item.course.toLowerCase().includes(text.toLowerCase())
    );
    setResults(filteredResults);
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultCourse}>{item.course}</Text>
          <Text style={styles.resultYear}>{item.year}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for PYQs, courses..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length > 0 && results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={results.length > 0 ? (
            <Text style={styles.resultsCount}>{results.length} results found</Text>
          ) : null}
        />
      )}

      {searchQuery.length === 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Popular Searches</Text>
          <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSearch('Data Structures')}>
            <Text>Data Structures</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSearch('Algorithms')}>
            <Text>Algorithms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSearch('Operating Systems')}>
            <Text>Operating Systems</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  resultItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultMeta: {
    flexDirection: 'row',
  },
  resultCourse: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  resultYear: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  suggestionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default SearchScreen;