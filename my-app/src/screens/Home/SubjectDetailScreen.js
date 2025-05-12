// FILE: my-app/src/screens/Home/SubjectDetailScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, FlatList, Platform, StatusBar, Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

// --- Tab Screen for Modules ---
function ModulesTabScreen({ route }) {
  const { modules, subjectId, subject } = route.params;
  const navigation = useNavigation();

  const handleModulePress = (selectedModule) => {
    navigation.navigate('QuestionsList', { subjectId, subject, module: selectedModule });
  };

  if (!modules || modules.length === 0) {
    return <View style={styles.emptyTabTextContainer}><Text style={styles.emptyTabText}>No modules available for this subject.</Text></View>;
  }

  console.log('[ModulesTabScreen] modules prop:', modules);

  return (
    <FlatList
      data={modules}
      keyExtractor={(item, index) => item._id || item.module_code || item.name || String(index)}
      renderItem={({ item, index }) => {
        console.log('[ModulesTabScreen] renderItem item:', item, 'index:', index);
        return (
          <TouchableOpacity
            style={styles.tabListItem}
            onPress={() => handleModulePress(item)}
          >
            <MaterialCommunityIcons name="folder-outline" size={24} color={COLORS.primary} style={styles.tabListItemIcon} />
            <Text style={styles.tabListItemText} numberOfLines={2}>
              {typeof item === 'string'
                ? item
                : item && (item.name || item.title || item.module_title || item.module_code)
                ? (item.name || item.title || item.module_title || item.module_code)
                : `Module ${index + 1}`}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={styles.tabListContentContainer}
    />
  );
}

// --- Tab Screen for Years ---
function YearsTabScreen({ route }) {
  const { years, subjectId, subject } = route.params;
  const navigation = useNavigation();

  const handleYearPress = (selectedYear) => {
    navigation.navigate('QuestionsList', { subjectId, subject, year: selectedYear });
  };
  
  if (!years || years.length === 0) {
    return <View style={styles.emptyTabTextContainer}><Text style={styles.emptyTabText}>No question years found for this subject.</Text></View>;
  }

  return (
    <FlatList
      data={years}
      keyExtractor={(item) => String(item)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.tabListItem}
          onPress={() => handleYearPress(item)}
        >
          <MaterialCommunityIcons name="calendar-blank-outline" size={24} color={COLORS.primary} style={styles.tabListItemIcon} />
          <Text style={styles.tabListItemText}>{item}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.tabListContentContainer}
    />
  );
}


export default function SubjectDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId, subject: routeSubject } = route.params || {};
  const { getSubjectDetails, fetchQuestions, userPreferences } = useApp(); // Assuming fetchQuestions can get all questions
  
  const [subject, setSubject] = useState(routeSubject || null);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]); // To derive years

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!subjectId) {
        setLoading(false);
        Alert.alert("Error", "Subject ID is missing.");
        navigation.goBack();
        return;
      }
      
      setLoading(true);
      try {
        // Fetch subject details if not passed or incomplete
        let currentSubjectData = routeSubject;
        if (!currentSubjectData || !currentSubjectData.modules) {
            const detailsResult = await getSubjectDetails(subjectId);
            currentSubjectData = detailsResult?.data || detailsResult;
        }
        setSubject(currentSubjectData);

        // Fetch all questions for the subject to derive years
        // Using a high limit; ideally, backend would provide distinct years or allow fetching all.
        const questionsResult = await fetchQuestions(subjectId, { limit: 1000 }); 
        setAllQuestions(questionsResult?.questions || []);

      } catch (err) {
        console.error("Error fetching subject data:", err);
        Alert.alert("Error", "Could not load subject details or questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [subjectId, routeSubject, getSubjectDetails, fetchQuestions]);

  // Memoize derived years to ensure stable reference
  const derivedYears = React.useMemo(
    () =>
      Array.from(new Set(allQuestions.map(q => q.year).filter(Boolean))).sort((a, b) => b - a),
    [allQuestions]
  );

  // --- Normalize modules, then memoize the result ---
  function normalizeModules(modulesRaw) {
    function objectToStringIfCharMap(obj) {
      if (
        obj && typeof obj === 'object' &&
        Object.keys(obj).length &&
        Object.keys(obj).every(key => /^\d+$/.test(key))
      ) {
        return Object.keys(obj)
          .sort((a, b) => Number(a) - Number(b))
          .map(k => obj[k])
          .join('');
      }
      return obj;
    }

    function removeModulePrefix(str) {
      // str.replace(/^Module\s*\d+\s*:\s*/i, '')
      return str;
    }

    let flat = Array.isArray(modulesRaw) && Array.isArray(modulesRaw[0]) ? modulesRaw.flat() : modulesRaw;
    return (flat || []).map(item => {
      if (typeof item === 'string') {
        return { name: removeModulePrefix(item) };
      }
      const asStr = objectToStringIfCharMap(item);
      if (typeof asStr === 'string') {
        return { name: removeModulePrefix(asStr) };
      }
      return item;
    });
  }
  const actualModules = React.useMemo(
    () => normalizeModules(subject?.modules || []),
    [subject?.modules]
  );

  // Branch/Semester info for header
  const branchName = subject?.branch?.name || userPreferences?.branch?.name || 'N/A';
  const semesterNumber = subject?.semester?.number || userPreferences?.semester?.number || 'N/A';

  // --- SHIMMER HOOKS SETUP AT TOP LEVEL ---
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const shimmerWidth = 96;
  const skeletonCardWidth = width - 30 - 10;
  React.useEffect(() => {
    if (loading) {
      shimmerAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => shimmerAnim.stopAnimation();
    }
  }, [shimmerAnim, loading]);

  if (loading) {
    // Skeleton tab screen for both tabs
    function SkeletonTabScreen() {
      const skeletonItems = Array.from({ length: 5 });
      return (
        <View style={{ padding: 15 }}>
          {skeletonItems.map((_, idx) => (
            <View key={idx} style={styles.skeletonTabCard}>
              <View style={styles.skeletonTabIcon} />
              <View style={styles.skeletonTabContent}>
                <View style={styles.skeletonTabLine} />
              </View>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.skeletonShimmer,
                  {
                    width: shimmerWidth,
                    transform: [
                      {
                        translateX: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-shimmerWidth, skeletonCardWidth + shimmerWidth],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.screenContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
        {subject && subject.name ? (
          <View style={styles.headerBar}>
            <TouchableOpacity
              onPress={navigation.goBack}
              style={styles.headerBackBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 25 }}
            >
              <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text numberOfLines={1} style={styles.headerTitleMain}>
                {subject.name}
                </Text>
                <Text numberOfLines={1} style={styles.headerSubtitle}>
                {branchName} • Sem {semesterNumber}
                </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.headerBar, { marginBottom: 12 }]}>
            <View style={styles.skeletonCircle} />
            <View style={styles.skeletonHeaderContent}>
              <View style={styles.skeletonLineHeaderShort} />
              <View style={styles.skeletonLineHeaderLong} />
            </View>
          </View>
        )}
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarLabelStyle: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
            tabBarIndicatorStyle: { backgroundColor: COLORS.primary, height: 3 },
            tabBarStyle: { backgroundColor: COLORS.white, elevation: 1, shadowOpacity: 0.05 },
          }}
        >
          <Tab.Screen name="Modules" component={SkeletonTabScreen} />
          <Tab.Screen name="Years" component={SkeletonTabScreen} />
        </Tab.Navigator>
      </View>
    );
  }

  if (!subject) {
     return (
      <View style={styles.fullScreenLoader}>
        <Text style={styles.errorText}>Subject data could not be loaded.</Text>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.headerBackBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 25 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text numberOfLines={1} style={styles.headerTitleMain}>
            {subject.name}
            </Text>
            <Text numberOfLines={1} style={styles.headerSubtitle}>
            {branchName} • Sem {semesterNumber}
            </Text>
        </View>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
          tabBarIndicatorStyle: { backgroundColor: COLORS.primary, height: 3 },
          tabBarStyle: { backgroundColor: COLORS.white, elevation: 1, shadowOpacity: 0.05 },
        }}
      >
        <Tab.Screen
          name="SubjectModules" // Changed name to avoid conflict if 'Modules' is a route name elsewhere
          component={ModulesTabScreen}
          options={{ title: 'Modules' }}
          initialParams={{ modules: actualModules, subjectId: subject._id, subject }}
        />
        <Tab.Screen
          name="SubjectYears" // Changed name
          component={YearsTabScreen}
          options={{ title: 'Years' }}
          initialParams={{ years: derivedYears, subjectId: subject._id, subject }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark, // Darker for more contrast
    paddingTop: Platform.OS === 'android' ? 10 : 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
  },
  headerBackBtn: {
    padding: 5, // Slightly larger touch area
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitleMain: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.white, // Lighter text for subtitle
    fontSize: 13,
    opacity: 0.9,
  },
  // Tab specific styles
  tabListContentContainer: {
    padding: 15,
    backgroundColor: COLORS.lightGray, // Light background for tab content
  },
  tabListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabListItemIcon: {
    marginRight: 15,
  },
  tabListItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textTitle,
    fontWeight: '500',
  },
  emptyTabTextContainer: {
      flex:1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20,
      backgroundColor: COLORS.lightGray,
  },
  emptyTabText: {
      fontSize: 16,
      color: COLORS.textSecondary,
  },

  // Skeleton styles for shimmer + cards
  skeletonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentBackground,
    marginRight: 15,
    opacity: 0.7,
  },
  skeletonHeaderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonLineHeaderShort: {
    width: 120,
    height: 15,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 9,
    marginBottom: 7,
    opacity: 0.7,
  },
  skeletonLineHeaderLong: {
    width: 85,
    height: 10,
    backgroundColor: COLORS.lightBorder,
    borderRadius: 8,
    opacity: 0.6,
  },
  skeletonTabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    opacity: 0.75,
  },
  skeletonTabIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accentBackground,
    marginRight: 15,
    opacity: 0.7,
  },
  skeletonTabContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonTabLine: {
    width: '80%',
    height: 12,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 7,
    opacity: 0.7,
  },
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.60)',
    opacity: 0.5,
  },

  // Skeleton tab navigator styles
  skeletonTabBarOuter: {
    backgroundColor: COLORS.white,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
    position: 'relative',
    zIndex: 1,
  },
  skeletonTabBarInner: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    position: 'relative',
    zIndex: 2,
  },
  skeletonTabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
    paddingTop: 0,
    backgroundColor: 'transparent',
    height: '100%',
  },
  skeletonTabBarItemActive: {
    // same as base, text color handled by text styles
  },
  skeletonTabBarText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'capitalize',
    letterSpacing: 0.15,
    marginTop: 16,
    marginBottom: 8,
  },
  skeletonTabBarTextActive: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    opacity: 1,
    textTransform: 'capitalize',
    letterSpacing: 0.15,
    marginTop: 16,
    marginBottom: 8,
  },
  skeletonTabBarIndicator: {
    position: 'absolute',
    left: 15,
    bottom: 0,
    width: '50%',
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    zIndex: 3,
  },
});
