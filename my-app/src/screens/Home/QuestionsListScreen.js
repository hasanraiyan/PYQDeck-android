// QuestionsListScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList
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
      if (year) filters.year = year;
      if (module && module.module_code) filters.chapter = module.module_code;
      const result = await fetchQuestions(subjectId, filters);
      setQuestions(result?.questions || []);
      setLoading(false);
    };
    fetchQ();
    // eslint-disable-next-line
  }, [subjectId, year, module && module.module_code]);

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
            : <Text style={{ textAlign: 'center', color: '#bbb', marginTop: 55 }}>
                No questions found for selected {year ? "year" : "module"}.
              </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.questionCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={styles.questionNo}>{item.short_code || item.question_no || item.q_code || 'Q'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.marks}>{item.marks ? `${item.marks} Marks` : ''}</Text>
                {item.completed && <MaterialCommunityIcons name="check-circle" size={22} color="#8f81e6" style={{ marginLeft: 8 }} />}
              </View>
            </View>
            <Text style={styles.questionText} numberOfLines={5}>{item.text || item.question || ''}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 9 }}>
              {/* Module/Chapter info */}
              {item.module && (
                <Text style={styles.metaText}>
                  {item.module.name || item.module.title || (module?.name ? `Module: ${module.name}` : '')}
                </Text>
              )}
              {/* Year */}
              {item.year && <Text style={[styles.metaText, { marginLeft: 15 }]}>Year: {item.year}</Text>}
              {/* Question type */}
              {item.type && <Text style={[styles.metaText, { marginLeft: 15 }]}>{item.type}</Text>}
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
    backgroundColor: '#8576E3',
    paddingTop: 44,
    paddingBottom: 22,
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: '#bbb4f8',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerBackBtn: {
    marginRight: 10,
    padding: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    flex: 1,
    fontWeight: 'bold',
    paddingLeft: 4,
    letterSpacing: 0.6,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 17,
    elevation: 2,
    shadowColor: '#EEEBF5',
    shadowOpacity: 0.07,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  questionNo: {
    color: '#6d3be0',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 3,
  },
  questionText: {
    color: '#26283c',
    fontSize: 15.5,
    fontWeight: '500',
    marginVertical: 5,
    lineHeight: 22
  },
  marks: {
    color: '#4F5590',
    fontWeight: '700',
    fontSize: 15,
  },
  metaText: {
    color: '#888baa',
    fontSize: 13.5,
    marginTop: 1,
    fontWeight: '600'
  },
});
