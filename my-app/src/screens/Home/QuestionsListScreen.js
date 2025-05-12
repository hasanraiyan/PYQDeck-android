// QuestionsListScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function QuestionsListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId, year, module, subject } = route.params || {};
  const { fetchQuestions } = useApp();

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

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fb' }}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.headerBackBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 25 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={29} color="#fff" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
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
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNo}>{item.qNumber || item.question_code_identifier || 'Q'}</Text>
              <View style={styles.questionMetaRight}>
                {item.marks && <Text style={styles.marks}>{item.marks} Marks</Text>}
                {/* Assuming completed status might come with question data in future */}
                {/* {item.completed && <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />} */}
              </View>
            </View>
            <Text style={styles.questionText}>{item.text || 'No question text available.'}</Text>
            <View style={styles.metaTagsContainer}>
              {item.chapter_module_name && <Text style={styles.metaTextTag}>Module: {item.chapter_module_name}</Text>}
              {item.year && <Text style={styles.metaTextTag}>Year: {item.year}</Text>}
              {item.type && <Text style={styles.metaTextTag}>Type: {item.type}</Text>}
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
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
  },
  headerBackBtn: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    flex: 1,
    fontWeight: 'bold',
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
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  questionNo: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  questionMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marks: {
    color: COLORS.textSubtitle,
    fontWeight: '600',
    fontSize: 14,
  },
  questionText: {
    color: COLORS.textBody,
    fontSize: 15.5,
    lineHeight: 23,
    marginBottom: 10,
  },
  metaTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightBorder,
    paddingTop: 8,
  },
  metaTextTag: {
    backgroundColor: COLORS.accentBackground,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
  },
});
