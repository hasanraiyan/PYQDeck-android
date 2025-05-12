// BrowseQuestionsScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BrowseQuestionsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId, subject: routeSubject } = route.params || {};
  const { fetchQuestions, getSubjectDetails } = useApp();

  const [years, setYears] = useState([]);
  const [modules, setModules] = useState([]);
  const [subject, setSubject] = useState(routeSubject || null);
  const [loading, setLoading] = useState(true);

  // Fetch all questions and subject details to build year/module lists from backend
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      let subj = routeSubject;
      if (!routeSubject && getSubjectDetails && subjectId) {
        const apiRes = await getSubjectDetails(subjectId);
        // If response has { data: {...} }, unwrap (matches backend contract shown)
        subj = apiRes && apiRes.data ? apiRes.data : apiRes;
      }
      setSubject(subj);

      let fetchedQuestions = [];
      if (fetchQuestions && subjectId) {
        // Pass only subjectId, no year filter, fetch all (limit can be adjusted if needed)
        const result = await fetchQuestions(subjectId, {});
        fetchedQuestions = result?.questions || [];
      }
      // Unique years from questions
      const uniqueYears = Array.from(
        new Set(
          fetchedQuestions
            .map(q => q.year)
            .filter(Boolean)
            .sort((a, b) => b - a)
        )
      );
      setYears(uniqueYears);

      // Modules list, prefer from fetched subject
      setModules(
        (subj && subj.modules && Array.isArray(subj.modules)) ? subj.modules : []
      );
      setLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line
  }, [subjectId]);

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
        <Text numberOfLines={1} style={styles.headerTitle}>
          {subject?.name || 'Select Year/Module'}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 22, paddingBottom: 44 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Browse by Year */}
            <Text style={styles.sectionHeading}>Browse by Year</Text>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={styles.rowBtn}
                onPress={() => navigation.navigate('QuestionsList', { subjectId, year, subject })}
              >
                <Text style={styles.rowBtnText}>{year}</Text>
                <MaterialCommunityIcons name="chevron-right" size={25} color="#a1a2b7" />
              </TouchableOpacity>
            ))}
            {years.length === 0 && (
              <Text style={styles.emptyText}>No past question years found.</Text>
            )}

            {/* Browse by Chapter (Module) */}
            <Text style={[styles.sectionHeading, { marginTop: 33 }]}>Browse by Chapter (Module)</Text>
            {modules.length > 0 ? (
              modules.map((mod, idx) => {
                let modName = '';
                if (mod && typeof mod === 'object' && !Array.isArray(mod)) {
                  // If mod is {"0":"M", ...} reconstruct string
                  modName = Object.values(mod).join('');
                } else if (typeof mod === 'string') {
                  modName = mod;
                } else if (mod && (mod.name || mod.title)) {
                  modName = mod.name || mod.title;
                }
                if (!modName) modName = 'Module';
                return (
                  <TouchableOpacity
                    key={mod._id || mod.module_code || mod.name || String(idx)}
                    style={styles.rowBtn}
                    onPress={() => navigation.navigate('QuestionsList', { subjectId, module: mod, subject })}
                  >
                    <Text style={styles.rowBtnText}>{modName}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={25} color="#a1a2b7" />
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No module information found.</Text>
            )}
          </>
        )}
      </ScrollView>
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
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#252750',
    marginBottom: 13,
  },
  rowBtn: {
    backgroundColor: '#fff',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#e2e2e7',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    justifyContent: 'space-between',
  },
  rowBtnText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#393958',
    flex: 1,
  },
  emptyText: {
    color: '#b5b8c9',
    fontSize: 15,
    marginTop: 8,
  },
});
