// QuestionsListScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Platform, StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function QuestionsListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId, year, module, subject } = route.params || {};
  const { fetchQuestions, userPreferences } = useApp();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch relevant questions by year or module
  useEffect(() => {
    const fetchQ = async () => {
      setLoading(true);
      let filters = {};
      if (year) {
        filters.year = year;
      }
      if (module && module.name) { // API expects chapter name
        filters.chapter = module.name;
      } else if (module && module.module_code && !module.name) {
        filters.chapter = module.module_code; 
      }
      const result = await fetchQuestions(subjectId, filters);
      setQuestions(result?.questions || []);
      setLoading(false);
    };
    if (subjectId) {
      fetchQ();
    } else {
      setLoading(false);
      console.warn("QuestionsListScreen: subjectId is missing.");
      // Optionally, show an error message to the user or navigate back
    }
  }, [subjectId, year, module, fetchQuestions]);

  // Title logic
  let title = subject?.name || 'Questions';
  if (year) title += ` • ${year}`;
  else if (module?.name) title += ` • ${module.name}`;

  // Header subtitle: branch and semester, with fallback
  const branchName =
    subject?.branch?.name ||
    userPreferences?.branch?.name ||
    'N/A';
  const semesterNumber =
    subject?.semester?.number ||
    userPreferences?.semester?.number ||
    'N/A';

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fb' }}>
      {/* Status bar to match SubjectDetailScreen */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      {/* Header */}
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
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {branchName} • Sem {semesterNumber}
          </Text>
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 18, paddingTop: 16, paddingBottom: 55 }}
        data={questions}
        keyExtractor={q => q._id}
        ListEmptyComponent={
          loading
            ? <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />
            : <View style={styles.emptyListContainer}>
                <MaterialCommunityIcons name="magnify-scan" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyListText}>
                  No questions found for the selected criteria.
                </Text>
              </View>
        }
        renderItem={({ item }) => (
          <View style={styles.questionCardV2}>
            {/* Tag Row */}
            <View style={styles.cardTagRow}>
              {item.year && (
                <View style={[styles.cardTag, { backgroundColor: "#e9f6fc" }]}>
                  <Text style={[styles.cardTagText, { color: "#18b6f6" }]}>{item.year}</Text>
                </View>
              )}
              {(item.qNumber || item.question_code_identifier) && (
                <View style={[styles.cardTag, { backgroundColor: "#fae8fd" }]}>
                  <Text style={[styles.cardTagText, { color: "#c130dd" }]}>
                    {item.qNumber || item.question_code_identifier}
                  </Text>
                </View>
              )}
              {item.marks && (
                <View style={[styles.cardTag, { backgroundColor: "#fff1e3" }]}>
                  <Text style={[styles.cardTagText, { color: "#ec8800" }]}>{item.marks} Marks</Text>
                </View>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.cardIconBtn}>
                <MaterialCommunityIcons name="bookmark-outline" color="#b8b9c2" size={23} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cardSwitchBtn}>
                <View style={styles.fakeSwitchTrack}>
                  <View style={styles.fakeSwitchThumb} />
                </View>
              </TouchableOpacity>
            </View>
            {/* Module Title Row */}
            {item.chapter_module_name && (
              <View style={styles.cardModuleRow}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  color="#755bc3"
                  size={18}
                />
                <Text style={styles.cardModuleText}>
                  {item.chapter_module_name.replace(/^Module\s*\d*\s*:?\s*/i, "")}
                </Text>
              </View>
            )}
            {/* Main Question */}
            <Text style={styles.cardQuestionText}>{item.text || "No question text available."}</Text>
            {/* Action Row */}
            <View style={styles.cardActionRow}>
              <TouchableOpacity style={styles.cardActionIcon}>
                <MaterialCommunityIcons name="share-variant" size={22} color="#8893a6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cardActionIcon}>
                <MaterialCommunityIcons name="content-copy" size={21} color="#8893a6" />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.cardAskAiBtn}>
                <MaterialCommunityIcons name="robot-outline" color="#fff" size={21} />
                <Text style={styles.cardAskAiBtnText}>Ask AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'android' ? 10 : 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
  },
  headerBackBtn: {
    padding: 5,
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
    color: COLORS.white,
    fontSize: 13,
    opacity: 0.9,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 90,
    paddingHorizontal: 20,
  },
  emptyListText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 15,
    lineHeight: 22,
  },
  // --- V2 Card Styles matching screenshot ---
  questionCardV2: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 25,
    shadowColor: "#b5b7c0",
    shadowOpacity: 0.18,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "#ededfa",
  },
  cardTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    minHeight: 28
  },
  cardTag: {
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 7,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  cardTagText: {
    fontWeight: "bold",
    fontSize: 13.1
  },
  cardIconBtn: {
    padding: 4,
    marginHorizontal: 2
  },
  cardSwitchBtn: {
    marginLeft: 0,
    padding: 3,
  },
  fakeSwitchTrack: {
    width: 31,
    height: 17,
    backgroundColor: "#f0f0f1",
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "flex-end",
    borderWidth: 1,
    borderColor: "#ececec"
  },
  fakeSwitchThumb: {
    width: 14,
    height: 14,
    backgroundColor: "#eee",
    borderRadius: 7,
    marginRight: 2,
    borderWidth: 1,
    borderColor: "#c8c8cf"
  },
  cardModuleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 1
  },
  cardModuleText: {
    color: "#755bc3",
    fontWeight: "700",
    fontSize: 15.1,
    marginLeft: 6
  },
  cardQuestionText: {
    color: COLORS.textBody,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24.5,
    marginBottom: 19,
    marginTop: 2
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    paddingTop: 2
  },
  cardActionIcon: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: "#f7f8fa",
    marginRight: 10
  },
  cardAskAiBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4427c1",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 22,
    marginLeft: 6
  },
  cardAskAiBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 7
  },
});
