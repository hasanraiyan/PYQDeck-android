import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, 
  ActivityIndicator, Dimensions, StatusBar, Animated, Platform
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SPACING = 16;

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
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Animation references
  const animatedScales = useRef({}).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerElevation = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 3],
    extrapolate: 'clamp',
  });

  // Get user data from context
  const branch = userPreferences?.branch?.name || '';
  const branchShort = userPreferences?.branch?.short_name || '';
  const branchCode = userPreferences?.branch?.branch_code || '';
  const semesterObj = userPreferences?.semester || {};
  const semLabel = semesterObj?.number
    ? `Semester ${semesterObj.number}`
    : (semesterObj?.semester_code || '');

  // Fetch subjects when semester changes
  useEffect(() => {
    const fetch = async () => {
      if (semesterObj && semesterObj._id) {
        setLoadingFeed(true);
        await fetchSubjects(semesterObj._id);
        setLoadingFeed(false);
      }
    };
    fetch();
  }, [semesterObj?._id, fetchSubjects]);

  // Filter subjects based on search
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

  // Card press animation
  const animateCardPress = (id) => {
    if (!animatedScales[id]) {
      animatedScales[id] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.timing(animatedScales[id], { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedScales[id], { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  // Handle subject card press
  const handleSubjectPress = useCallback((subject) => {
    animateCardPress(subject._id);
    setTimeout(() => {
      navigation.navigate('SubjectDetail', { subjectId: subject._id, subject });
    }, 150);
  }, [navigation]);

  // Clear search query
  const clearSearch = () => setSearch('');

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            elevation: headerElevation,
            shadowOpacity: headerElevation.__getValue() / 10,
            backgroundColor: COLORS.primary, // Use primary as header background
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.logo} accessibilityRole="header">PYQDECK</Text>
            <Text style={styles.subtitleHeader} numberOfLines={1}>
              {`${branchShort || branchCode || branch}${branchShort && branchShort !== branchCode ? ` (${branchCode})` : ''}`}
              {semLabel ? ` • ${semLabel}` : ''}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileIconTouchable}
              onPress={() => navigation.navigate('Profile')}
              accessibilityLabel="Go to profile"
              accessibilityHint="Navigates to user profile"
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="account-circle" size={32} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      {loadingFeed || (loading && subjects.length === 0) ? (
        <View style={styles.centeredFeedback}>
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: SPACING }} />
          <Text style={styles.loadingText}>Loading your subjects...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredFeedback}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color={COLORS.error} style={{ marginBottom: SPACING }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchSubjects(semesterObj._id)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={[
              styles.searchBarContainer,
              searchFocused && styles.searchBarFocused
            ]}>
              <MaterialCommunityIcons name="magnify" size={20} color={searchFocused ? COLORS.primary : COLORS.textSubtitle} style={styles.searchIcon} />
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
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.clearSearchButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  accessibilityHint="Clears the search field"
                >
                  <View style={styles.clearSearchHitbox}>
                    <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Subject Count */}
          {subjects && subjects.length > 0 && (
            <View style={styles.subjectCountContainer}>
              <Text style={styles.subjectCountText}>
                {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'} {search ? 'found' : 'available'}
              </Text>
            </View>
          )}

          {/* Subject List */}
          <Animated.FlatList
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            data={filteredSubjects}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
            style={styles.listBackgroundAccent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              if (!animatedScales[item._id]) {
                animatedScales[item._id] = new Animated.Value(1);
              }

              return (
                <Animated.View 
                  style={[
                    styles.subjectCardWrapper, 
                    { 
                      transform: [{ scale: animatedScales[item._id] }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.subjectCardTouchable}
                    onPress={() => handleSubjectPress(item)}
                    activeOpacity={0.93}
                    accessibilityLabel={`View subject: ${item.name}`}
                    accessibilityHint="Navigates to subject details"
                  >
                    <View style={styles.subjectCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.subjectCode}>{item.code}</Text>
                        <MaterialCommunityIcons 
                          name="chevron-right" 
                          size={24}
                          color={'rgba(68,80,105,0.54)'}
                          style={styles.cardChevron} 
                          accessibilityLabel="Go to subject"
                        />
                      </View>

                      <Text numberOfLines={2} style={styles.subjectTitle}>{item.name}</Text>

                      <View style={styles.cardFooter}>
                        <Text style={styles.subjectFooterText} numberOfLines={1}>
                          {`${branchShort || branchCode || branch}${semesterObj.semester_code ? ` • ${semesterObj.semester_code}` : semLabel ? ` • ${semLabel}` : ''}`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centeredFeedback}>
                <MaterialCommunityIcons name="book-search-outline" size={56} color={COLORS.mediumGray} style={{ marginBottom: SPACING }} />
                <Text style={styles.emptyStateTitle}>
                  {search ? `No results found` : `No subjects available`}
                </Text>
                <Text style={styles.emptyStateText}>
                  {search ? `Try a different search term` : `No subjects found for the current semester`}
                </Text>
              </View>
            }
          />
        </>
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
    paddingBottom: SPACING * 0.75,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 0, // Remove border—rely on shadow for separation
    borderBottomColor: COLORS.primaryDark,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.18,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: SPACING * 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(44,44,44,0.16)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleHeader: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.84)',
    fontWeight: '600',
    marginTop: 2,
    maxWidth: width * 0.7,
  },
  profileIconTouchable: {
    padding: 8, // Minimum 44x44 touch target (icon is 32 so 6 px pad, bump for safety)
    borderRadius: 22,
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
    borderRadius: 12,
    paddingHorizontal: SPACING,
    paddingVertical: SPACING * 0.4,
    borderWidth: 1,
    borderColor: COLORS.transparent,
  },
  searchBarFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.inputBackground,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  clearSearchButton: {
    marginLeft: 2,
  },
  clearSearchHitbox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  subjectCountContainer: {
    paddingHorizontal: SPACING,
    paddingTop: SPACING * 0.2,
    paddingBottom: SPACING * 0.5,
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
  },
  subjectCountText: {
    fontSize: 14,
    color: COLORS.textSubtitle,
    fontWeight: '600',
  },
  listBackgroundAccent: {
    backgroundColor: COLORS.accentBackground,
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: SPACING * 2,
    paddingHorizontal: SPACING,
    paddingTop: SPACING,
  },
  subjectCardWrapper: {
    marginBottom: SPACING,
  },
  subjectCardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 48,
  },
  subjectCard: {
    backgroundColor: COLORS.cardBackgroundLight,
    borderRadius: 16,
    padding: SPACING,
    borderWidth: 1,
    borderColor: COLORS.accent,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 76,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  subjectCode: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLORS.primary,
    letterSpacing: 1,
    opacity: 0.82,
  },
  cardChevron: {
    marginLeft: 8,
  },
  subjectTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textTitle,
    marginBottom: 4,
    marginTop: 2,
    letterSpacing: 0.04,
  },
  cardFooter: {
    marginTop: 8,
  },
  subjectFooterText: {
    fontSize: 13,
    color: COLORS.textSubtitle,
    fontWeight: '500',
    opacity: 0.70,
  },
  centeredFeedback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: SPACING * 2,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 4,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    marginBottom: 6,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    color: COLORS.mediumGray,
    fontWeight: '500',
    marginBottom: 3,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textSubtitle,
    textAlign: 'center',
  },
});
