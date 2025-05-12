// SubjectDetailScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SubjectDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId } = route.params || {};
  const { getSubjectDetails, fetchQuestions, userPreferences } = useApp();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deducedModules, setDeducedModules] = useState([]);

  useEffect(() => {
    const fetchSubjectAndModules = async () => {
      if (getSubjectDetails && subjectId) {
        setLoading(true);
        const apiRes = await getSubjectDetails(subjectId);
        const subj = apiRes && apiRes.data ? apiRes.data : apiRes;
        setSubject(subj);
        if (typeof window !== 'undefined' && window.console) {
          console.log('SUBJECT LOADED:', subj);
        }
        // Dedupe modules if subject.modules is missing/empty
        if (!subj.modules || !Array.isArray(subj.modules) || subj.modules.length === 0) {
          if (fetchQuestions && subjectId) {
            const qRes = await fetchQuestions(subjectId, {});
            const questions = (qRes && qRes.questions) ? qRes.questions : [];
            if (typeof window !== 'undefined' && window.console) {
              console.log('ALL QUESTIONS RETURNED:', questions);
            }
            const moduleMap = {};
            questions.forEach(q => {
              if (q.module && (q.module.module_code || q.module._id)) {
                const key = q.module.module_code || q.module._id;
                if (!moduleMap[key]) {
                  moduleMap[key] = {
                    ...q.module
                  };
                }
              }
            });
            const modulesArr = Object.values(moduleMap);
            setDeducedModules(modulesArr);
            if (typeof window !== 'undefined' && window.console) {
              console.log('DEDUCED MODULES:', modulesArr);
            }
          }
        } else {
          setDeducedModules([]); // clear - use subj.modules in display
        }
        setLoading(false);
      }
    };
    fetchSubjectAndModules();
  }, [getSubjectDetails, fetchQuestions, subjectId]);

  // Branch/Semester info
  const branchLabel =
    subject?.branch?.name || userPreferences?.branch?.name || 'Branch not found';
  const branchCode =
    subject?.branch?.branch_code || userPreferences?.branch?.branch_code || '';
  const semesterLabel =
    subject?.semester?.number
      ? `${subject.semester.number} (${subject.semester.semester_code || ''})`
      : (userPreferences?.semester?.number ? `${userPreferences.semester.number} (${userPreferences.semester.semester_code || ''})` : '');

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fb' }}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.headerBackBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 25 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={29} color="#fff" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {subject?.name || 'Loading...'}
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
            {/* Basic Info Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Basic Info</Text>
              <View style={styles.divider} />
              <InfoRow label="Code" value={subject?.code} />
              <InfoRow label="Identifier" value={subject ? (subject.branch?.branch_code ? `${subject.branch.branch_code}_${subject.code}` : subject.code) : '-'} />
              <InfoRow label="Branch" value={`${branchLabel}${branchCode ? ` (${branchCode})` : ''}`} />
              <InfoRow label="Semester" value={semesterLabel} />
            </View>

            {/* Modules Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Modules</Text>
              <View style={styles.divider} />
              {(subject && subject.modules && Array.isArray(subject.modules) && subject.modules.length > 0
                  ? subject.modules
                  : deducedModules && deducedModules.length > 0
                ) ? (
                <View>
                  {(subject && subject.modules && Array.isArray(subject.modules) && subject.modules.length > 0
                    ? subject.modules
                    : deducedModules
                  ).map((mod, idx) => (
                    <View
                      key={mod._id || mod.module_code || mod.name || String(idx)}
                      style={styles.moduleBtn}
                    >
                      <Text style={styles.moduleItem}>
                        {mod && typeof mod === 'object' && !Array.isArray(mod)
                          ? Object.values(mod).join('')
                          : mod.name || mod.title || (typeof mod === 'string' ? mod : `Module ${idx + 1}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyModuleText}>No module information available.</Text>
              )}
            </View>

            {/* Browse Questions Button */}
            <TouchableOpacity
              style={styles.browseBtn}
              activeOpacity={0.90}
              onPress={() => navigation.navigate('BrowseQuestions', { subjectId: subject?._id, subject })}
            >
              <Text style={styles.browseBtnText}>Browse Questions</Text>
              <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 26,
    elevation: 2,
    shadowColor: '#DFD7F6',
    shadowOpacity: 0.09,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#252750',
    marginBottom: 10,
  },
  divider: {
    borderBottomColor: '#ebebeb',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#727891',
    fontWeight: '600',
    marginRight: 12,
    minWidth: 92,
  },
  infoValue: {
    fontSize: 15,
    color: '#1C2431',
    flex: 1,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  moduleItem: {
    paddingVertical: 4,
    fontSize: 15,
    color: '#4e557a',
    marginBottom: 3,
  },
  moduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
    paddingVertical: 10,
    backgroundColor: '#f6f5fa',
    borderRadius: 7,
    paddingHorizontal: 5,
    marginBottom: 4,
  },
  emptyModuleText: {
    color: '#BAC1D3',
    fontSize: 15,
    textAlign: 'left',
    paddingVertical: 6,
  },
  browseBtn: {
    backgroundColor: '#8576E3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    borderRadius: 11,
    paddingVertical: 17,
    shadowColor: '#8576E3',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  browseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
    letterSpacing: 0.5,
  },
});
