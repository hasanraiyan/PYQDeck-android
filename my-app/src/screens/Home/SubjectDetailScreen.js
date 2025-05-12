// FILE: my-app/src/screens/Home/SubjectDetailScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, FlatList, Platform, StatusBar
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
      return str.replace(/^Module\s*\d+\s*:\s*/i, '');
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

  if (loading) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Subject Details...</Text>
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
    color: COLORS.accent, // Lighter text for subtitle
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
  }
});
