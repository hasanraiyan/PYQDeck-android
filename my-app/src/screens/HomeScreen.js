// HomeScreen.js – Subject Feed UI

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Dimensions,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    userPreferences,
    fetchSubjects,
    subjects,
    loading,
    error,
  } = useApp();
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Branch & semester info for header UI
  const branch = userPreferences?.branch?.name || '';
  const branchShort = userPreferences?.branch?.short_name || '';
  const branchCode = userPreferences?.branch?.branch_code || '';
  const semesterObj = userPreferences?.semester || {};
  const semLabel = semesterObj?.number
    ? `Semester ${semesterObj.number}`
    : (semesterObj?.semester_code || '');

  // Fetch subjects on mount or if semester changes
  useEffect(() => {
    const fetch = async () => {
      if (semesterObj && semesterObj._id) {
        setLoadingFeed(true);
        await fetchSubjects(semesterObj._id);
        setLoadingFeed(false);
      }
    };
    fetch();
    // eslint-disable-next-line
  }, [semesterObj?._id]);

  useEffect(() => {
    // Apply search filter
    if (!search) setFilteredSubjects(subjects || []);
    else {
      setFilteredSubjects(
        (subjects || []).filter(s =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.code?.toString().includes(search)
        )
      );
    }
  }, [subjects, search]);

  const handleSubjectPress = useCallback((subject) => {
    // Navigate to SubjectDetailScreen (to be implemented in nav stack)
    navigation.navigate('SubjectDetail', { subjectId: subject._id, subject });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>PYQDeck</Text>
          <Text style={styles.subtitleHeader}>
            {branch.toUpperCase()}{branchShort ? ` (${branchShort})` : ''} 
            {semLabel ? ` - ${semLabel}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="account-circle-outline" size={34} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#888" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            subjects?.length
              ? `Search ${subjects.length} subjects...`
              : 'Search subjects...'
          }
          placeholderTextColor="#AAA"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Subject Feed */}
      {loadingFeed || loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.subjectCard}
              onPress={() => handleSubjectPress(item)}
              activeOpacity={0.85}
            >
              <Text numberOfLines={2} style={styles.subjectTitle}>{item.name}</Text>
              <Text style={styles.subjectCode}>{item.code}</Text>
              <Text style={styles.subjectFooterText}>
                {branchShort || branchCode || branch}
                {semesterObj.semester_code ? ` - ${semesterObj.semester_code}` : semLabel ? ` - Sem ${semesterObj.number}` : ''}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#AAA', marginTop: 70, fontSize: 16 }}>
              No subjects found for the current semester.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginHorizontal: 24,
    marginBottom: 15,
  },
  logo: {
    fontSize: 30,
    letterSpacing: 1.2,
    fontWeight: 'bold',
    color: '#232536',
  },
  subtitleHeader: {
    fontSize: 16,
    color: '#747C92',
    fontWeight: '500',
    marginTop: 2,
  },
  profileIcon: {
    marginLeft: 18,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#D1D0D3',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    color: '#222',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginLeft: 2,
    minHeight: 38,
  },
  errorText: {
    color: COLORS.error || '#d00',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 34,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#C1C7E6',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  subjectCode: {
    fontSize: 14,
    color: '#727B96',
    fontWeight: '600',
    marginBottom: 3,
  },
  subjectFooterText: {
    fontSize: 13,
    color: '#8A99AF',
    fontStyle: 'italic',
    marginTop: 3,
    letterSpacing: 0.1,
  },
});
