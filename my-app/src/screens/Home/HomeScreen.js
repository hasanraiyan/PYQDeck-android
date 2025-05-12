// src/screens/Home/HomeScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, Dimensions, StatusBar, Animated, Platform, Keyboard, Pressable
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors'; // Ensure this path is correct
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const SPACING = 16;
const CARD_WIDTH = width - (SPACING * 2);

export default function HomeScreen() {
  const {
    currentUser, // Assuming currentUser is available from useApp or needs to be from useAuth
    userPreferences,
    fetchSubjects,
    subjects,
    loading, // This is the general loading from AppContext for fetching subjects
    error,
  } = useApp();
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [initialFeedLoading, setInitialFeedLoading] = useState(true); // Specific for initial screen render
  const [searchFocused, setSearchFocused] = useState(false);

  const animatedScales = useRef({}).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -30], // Adjust this value to control how much header scrolls up
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });
  
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -30], // Should match header's scroll up distance or be slightly less
    extrapolate: 'clamp',
  });


  const userName = currentUser?.name || userPreferences?.userId || 'User';
  const branch = userPreferences?.branch?.name || '';
  const semesterObj = userPreferences?.semester || {};
  const semLabel = semesterObj?.number ? `Sem ${semesterObj.number}` : (semesterObj?.semester_code || '');

  useEffect(() => {
    const fetchInitialData = async () => {
      if (semesterObj && semesterObj._id) {
        setInitialFeedLoading(true);
        await fetchSubjects(semesterObj._id);
        setInitialFeedLoading(false);
      } else {
        setInitialFeedLoading(false); // No semester, nothing to load
      }
    };
    fetchInitialData();
  }, [semesterObj?._id, fetchSubjects]);

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
      Animated.timing(animatedScales[id], { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedScales[id], { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleSubjectPress = useCallback((subject) => {
    animateCardPress(subject._id);
    setTimeout(() => {
      navigation.navigate('SubjectDetail', { subjectId: subject._id, subject });
    }, 150);
  }, [navigation]);

  const clearSearch = () => setSearch('');

  const renderHeader = () => (
    <>
      {/* Header row with greeting on the left and profile on the right */}
      <Animated.View style={[
        styles.headerRowContainer,
        { transform: [{ translateY: headerTranslateY }], opacity: headerOpacity }
      ]}>
        <View style={styles.headerRowText}>
          <Text style={styles.greetingText}>Hello, {userName}!</Text>
          <Text style={styles.headerSubtitle}>
            {branch ? `${branch} • ${semLabel}` : 'Select Branch/Semester'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Go to profile"
          style={styles.headerProfileBtn}
        >
          <MaterialCommunityIcons name="account-circle-outline" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[
        styles.searchSection,
        { transform: [{ translateY: searchBarTranslateY }] }
      ]}>
        <View style={[styles.searchBarContainer, searchFocused && styles.searchBarFocused]}>
          <MaterialCommunityIcons name="magnify" size={22} color={searchFocused ? COLORS.primary : COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects or codes..."
            placeholderTextColor={COLORS.placeholderGrey}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            selectionColor={COLORS.primary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      {(!initialFeedLoading && !loading && subjects?.length > 0) && (
         <Text style={styles.listHeaderTitle}>Your Subjects</Text>
      )}
    </>
  );

if (initialFeedLoading || (loading && (!subjects || subjects.length === 0))) {
    // Skeleton loader instead of spinner
    const skeletonItems = Array.from({ length: 6 });

    return (
      <Pressable style={styles.screen} onPress={Keyboard.dismiss} accessible={false}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
        <View style={styles.headerRowContainer}>
          <View style={styles.headerRowText}>
            <Text style={styles.greetingText}>Hello, {userName}!</Text>
            <Text style={styles.headerSubtitle}>
              {branch ? `${branch} • ${semLabel}` : 'Select Branch/Semester'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Go to profile"
            style={styles.headerProfileBtn}
          >
            <MaterialCommunityIcons name="account-circle-outline" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchSection}>
          <View style={[styles.searchBarContainer, searchFocused && styles.searchBarFocused]}>
            <MaterialCommunityIcons name="magnify" size={22} color={searchFocused ? COLORS.primary : COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search subjects or codes..."
              placeholderTextColor={COLORS.placeholderGrey}
              value={search}
              editable={false}
              selectionColor={COLORS.primary}
            />
          </View>
        </View>
        <View style={styles.skeletonListContainer}>
          {skeletonItems.map((_, idx) => (
            <View key={idx} style={styles.skeletonCard}>
              <View style={styles.skeletonCardIcon} />
              <View style={styles.skeletonCardContent}>
                <View style={styles.skeletonLineShort} />
                <View style={styles.skeletonLineLong} />
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredFeedback}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} style={{ marginBottom: SPACING / 2 }} />
        <Text style={styles.errorText}>Failed to load subjects.</Text>
        <Text style={styles.errorDetailText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchSubjects(semesterObj._id)} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Pressable style={styles.screen} onPress={Keyboard.dismiss} accessible={false}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
      {/* Header row with greeting on the left and profile on the right */}
      <View style={styles.headerRowContainer}>
        <View style={styles.headerRowText}>
          <Text style={styles.greetingText}>Hello, {userName}!</Text>
          <Text style={styles.headerSubtitle}>
            {branch ? `${branch} • ${semLabel}` : 'Select Branch/Semester'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Go to profile"
          style={styles.headerProfileBtn}
        >
          <MaterialCommunityIcons name="account-circle-outline" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBarContainer, searchFocused && styles.searchBarFocused]}>
          <MaterialCommunityIcons name="magnify" size={22} color={searchFocused ? COLORS.primary : COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects or codes..."
            placeholderTextColor={COLORS.placeholderGrey}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            selectionColor={COLORS.primary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {(!initialFeedLoading && !loading && subjects?.length > 0) && (
         <Text style={styles.listHeaderTitle}>Your Subjects</Text>
      )}

      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // set to false because of layout animations potentially
        )}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          if (!animatedScales[item._id]) {
            animatedScales[item._id] = new Animated.Value(1);
          }
          return (
            <Animated.View style={{ transform: [{ scale: animatedScales[item._id] }] }}>
              <TouchableOpacity
                style={styles.subjectCard}
                onPress={() => handleSubjectPress(item)}
                activeOpacity={0.85}
              >
                <View style={styles.cardIconContainer}>
                  <MaterialCommunityIcons name="book-open-page-variant-outline" size={28} color={COLORS.primary} />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.subjectTitle} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.subjectCode}>Code: {item.code}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={26} color={COLORS.mediumGray} />
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centeredFeedback}>
            <MaterialCommunityIcons name="book-search-outline" size={60} color={COLORS.mediumGray} style={{ marginBottom: SPACING }} />
            <Text style={styles.emptyStateTitle}>
              {search ? `No results for "${search}"` : `No Subjects Found`}
            </Text>
            <Text style={styles.emptyStateText}>
              {search ? `Try a different search term or check your spelling.` : `It seems there are no subjects for your selected semester, or try personalizing your preferences.`}
            </Text>
          </View>
        }
      />
      {/* Removed absolutely positioned floating profile button in favor of header integration */}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  skeletonListContainer: {
    paddingHorizontal: SPACING,
    paddingTop: SPACING,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING,
    marginBottom: SPACING,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    opacity: 0.75,
  },
  skeletonCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.accentBackground,
    marginRight: SPACING,
  },
  skeletonCardContent: {
    flex: 1,
    marginRight: SPACING / 2,
    justifyContent: 'center',
  },
  skeletonLineShort: {
    width: '65%',
    height: 16,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonLineLong: {
    width: '40%',
    height: 12,
    backgroundColor: COLORS.lightBorder,
    borderRadius: 7,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background, // Changed to white for a cleaner look
  },
  // Header now has row for greeting/profile
  headerRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingBottom: SPACING * 0.5,
    backgroundColor: COLORS.primaryDark,
    color: COLORS.textTitle,
    padding: SPACING,
  },
  headerRowText: {
    flex: 1,
    
  },
  headerProfileBtn: {
    marginLeft: 12,
    padding: 4,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.white,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: SPACING,
    paddingVertical: SPACING,
    backgroundColor: COLORS.background, // Keep search on white bg
    zIndex: 1, // Ensure search is above scrolling content if header shrinks completely
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentBackground, // Lighter background for search
    borderRadius: 12,
    paddingHorizontal: SPACING,
  },
  searchBarFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: COLORS.white, // Change to white on focus
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textTitle,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  clearSearchButton: {
    padding: 8,
  },
  listHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textTitle,
    paddingHorizontal: SPACING,
    marginBottom: SPACING * 0.75,
  },
  listContentContainer: {
    paddingHorizontal: SPACING,
    paddingBottom: SPACING * 5, // More space at bottom
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING,
    marginBottom: SPACING,
    borderWidth: 1,
    borderColor: COLORS.lightBorder, // Subtle border
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.accentBackground, // Light purple accent
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: SPACING / 2,
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '600', // Semi-bold for better readability
    color: COLORS.textTitle,
    marginBottom: 4,
  },
  subjectCode: {
    fontSize: 13,
    color: COLORS.textSubtitle,
    fontWeight: '500',
  },
  centeredFeedback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING * 2,
    marginTop: height * 0.15, // Push down a bit
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textBody,
    marginTop: SPACING,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING / 2,
  },
  errorDetailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING * 1.5,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING * 2,
    paddingVertical: SPACING * 0.75,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textTitle,
    textAlign: 'center',
    marginBottom: SPACING / 2,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
