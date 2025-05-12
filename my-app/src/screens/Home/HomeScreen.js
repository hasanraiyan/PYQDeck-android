import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, StatusBar, Animated, Platform,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors'; // Using the original full COLORS palette
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SPACING = 16; // Base spacing unit, similar to what's derived from other screens

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
  const [searchFocused, setSearchFocused] = useState(false); // For search bar focus style

  const animatedScales = useRef({}).current;

  const branch = userPreferences?.branch?.name || '';
  const branchShort = userPreferences?.branch?.short_name || '';
  const branchCode = userPreferences?.branch?.branch_code || '';
  const semesterObj = userPreferences?.semester || {};
  const semLabel = semesterObj?.number
    ? `Semester ${semesterObj.number}`
    : (semesterObj?.semester_code || '');

  useEffect(() => {
    const fetch = async () => {
      if (semesterObj && semesterObj._id) {
        setLoadingFeed(true);
        await fetchSubjects(semesterObj._id);
        setLoadingFeed(false);
      }
    };
    fetch();
  }, [semesterObj?._id, fetchSubjects]); // Added fetchSubjects to dependencies

  useEffect(() => {
    if (!search) {
      setFilteredSubjects(subjects || []);
    } else {
      setFilteredSubjects(
        (subjects || []).filter(s =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.code?.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [subjects, search]);

  const animateCardPress = (id) => {
    if (!animatedScales[id]) {
      animatedScales[id] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.timing(animatedScales[id], { toValue: 0.97, duration: 150, useNativeDriver: true }),
      Animated.timing(animatedScales[id], { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleSubjectPress = useCallback((subject) => {
    animateCardPress(subject._id);
    setTimeout(() => {
      navigation.navigate('SubjectDetail', { subjectId: subject._id, subject });
    }, 180);
  }, [navigation]);

  const clearSearch = () => setSearch('');

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo} accessibilityRole="header">PYQDECK</Text>
          <Text style={styles.subtitleHeader} numberOfLines={1}>
            {`${branchShort || branchCode || branch}${branchShort && branchShort !== branchCode ? ` (${branchCode})` : ''}`}
            {semLabel ? ` - ${semLabel}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileIconTouchable}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Go to profile"
        >
          <MaterialCommunityIcons name="account-circle-outline" size={32} color={COLORS.textSubtitle} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[
          styles.searchBarContainer,
          searchFocused && styles.searchBarFocused
        ]}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSubtitle} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={subjects?.length ? `Search ${subjects.length} subjects...` : 'Search subjects...'}
            placeholderTextColor={COLORS.placeholderGrey}
            value={search}
            onChangeText={setSearch}
            blurOnSubmit={false}
            selectionColor={COLORS.primary}
            autoCorrect={false}
            autoCapitalize="none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            underlineColorAndroid="transparent"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.textSubtitle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Subject Feed */}
      {loadingFeed || (loading && subjects.length === 0) ? ( // Show loading if feed is loading OR initial app loading & no subjects yet
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.centeredFeedback} />
      ) : error ? (
        <View style={styles.centeredFeedback}>
          <MaterialCommunityIcons name="alert-circle-outline" size={32} color={COLORS.error} style={{ marginBottom: SPACING / 2 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchSubjects(semesterObj._id)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          data={filteredSubjects}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (!animatedScales[item._id]) {
              animatedScales[item._id] = new Animated.Value(1);
            }
            return (
              <Animated.View style={[styles.subjectCardWrapper, { transform: [{ scale: animatedScales[item._id] }] }]}>
                <TouchableOpacity
                  style={styles.subjectCard}
                  onPress={() => handleSubjectPress(item)}
                  activeOpacity={1} // Animation handles feedback
                >
                  <View style={styles.cardHeader}>
                    <Text numberOfLines={2} style={styles.subjectTitle}>{item.name}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSubtitle} style={styles.cardChevron} />
                  </View>
                  <Text style={styles.subjectCode}>{item.code}</Text>
                  <Text style={styles.subjectFooterText} numberOfLines={1}>
                    {`${branchShort || branchCode || branch}${semesterObj.semester_code ? ` - ${semesterObj.semester_code}` : semLabel ? ` - Sem ${semesterObj.number}` : ''}`}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centeredFeedback}>
              <MaterialCommunityIcons name="inbox-outline" size={48} color={COLORS.mediumGray} style={{ marginBottom: SPACING }} />
              <Text style={styles.emptyStateText}>
                {search ? `No subjects found for "${search}"` : `No subjects for current semester.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: SPACING * 0.75,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
  },
  logo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 2,
  },
  subtitleHeader: {
    fontSize: 15,
    color: COLORS.textSubtitle,
    fontWeight: '600',
    marginTop: 2,
    marginLeft: 2,
    maxWidth: width * 0.7,
  },
  profileIconTouchable: {
    marginLeft: SPACING / 2,
    padding: 2,
    borderRadius: 18,
  },
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING,
    paddingTop: SPACING * 0.5,
    paddingBottom: SPACING,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    paddingHorizontal: SPACING,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  searchBarFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 2,
    backgroundColor: 'transparent',
  },
  clearSearchButton: {
    marginLeft: 4,
    padding: 2,
  },
  listContentContainer: {
    padding: SPACING,
    paddingBottom: SPACING * 1.5,
  },
  subjectCardWrapper: {
    marginBottom: SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: COLORS.white,
  },
  subjectCard: {
    padding: SPACING,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  subjectTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  cardChevron: {},
  subjectCode: {
    fontSize: 13,
    color: COLORS.textSubtitle,
    marginBottom: 4,
    letterSpacing: 1,
    fontWeight: '500',
  },
  subjectFooterText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 0,
  },
  centeredFeedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING * 2,
    minHeight: 220,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: SPACING / 2,
  },
  retryButton: {
    marginTop: SPACING / 2,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING * 1.5,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  emptyStateText: {
    color: COLORS.mediumGray,
    textAlign: 'center',
    fontSize: 15,
    marginTop: 2,
    fontStyle: 'italic',
    maxWidth: width * 0.75,
  },
});
