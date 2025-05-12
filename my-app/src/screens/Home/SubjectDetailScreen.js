// SubjectDetailScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  Pressable,
  
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const SPACING = 16;

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
        // Dedupe modules if subject.modules is missing/empty
        if (!subj.modules || !Array.isArray(subj.modules) || subj.modules.length === 0) {
          if (fetchQuestions && subjectId) {
            const qRes = await fetchQuestions(subjectId, {});
            const questions = (qRes && qRes.questions) ? qRes.questions : [];
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
      ? `Sem ${subject.semester.number}${subject.semester.semester_code ? ` (${subject.semester.semester_code})` : ''}`
      : userPreferences?.semester?.number
      ? `Sem ${userPreferences.semester.number}${userPreferences.semester.semester_code ? ` (${userPreferences.semester.semester_code})` : ''}`
      : '';

  return (
    <Pressable style={styles.screen} onPress={() => {}}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.headerBackBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 25 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={29} color={COLORS.white} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {subject?.name || 'Loading...'}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centeredFeedback}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Loading subject details...</Text>
          </View>
        ) : (
          <>
            {/* Basic Info Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} /> Basic Info
              </Text>
              <View style={styles.divider} />
              <InfoRow
                icon="identifier"
                label="Code"
                value={subject?.code}
              />
              <InfoRow
                icon="numeric"
                label="Identifier"
                value={
                  subject 
                    ? (subject.branch?.branch_code
                        ? `${subject.branch.branch_code}_${subject.code}`
                        : subject.code)
                    : '-'
                }
              />
              <InfoRow
                icon="source-branch"
                label="Branch"
                value={`${branchLabel}${branchCode ? ` (${branchCode})` : ''}`}
              />
              <InfoRow
                icon="format-list-numbered"
                label="Semester"
                value={semesterLabel}
              />
            </View>

            {/* Modules Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                <MaterialCommunityIcons name="view-module" size={20} color={COLORS.primary} /> Modules
              </Text>
              <View style={styles.divider} />
              {
                (subject && subject.modules && Array.isArray(subject.modules) && subject.modules.length > 0
                  ? subject.modules
                  : deducedModules && deducedModules.length > 0
                ) ? (
                  <View>
                    {
                      (subject && subject.modules && Array.isArray(subject.modules) && subject.modules.length > 0
                        ? subject.modules
                        : deducedModules
                      ).map((mod, idx) => (
                        <AnimatedModuleCard
                          key={mod._id || mod.module_code || mod.name || String(idx)}
                          mod={mod}
                          idx={idx}
                        />
                      ))
                    }
                  </View>
                ) : (
                  <View style={styles.centeredFeedback}>
                    <MaterialCommunityIcons
                      name="cube-off-outline"
                      size={32}
                      color={COLORS.mediumGray}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={styles.emptyModuleText}>No module information available.</Text>
                  </View>
                )
              }
            </View>

            {/* Browse Questions Button */}
            <TouchableOpacity
              style={styles.browseBtn}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('BrowseQuestions', { subjectId: subject?._id, subject })}
            >
              <MaterialCommunityIcons name="book-open-page-variant-outline" size={22} color={COLORS.white} />
              <Text style={styles.browseBtnText}>Browse Questions</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </Pressable>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <View style={styles.infoRow}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={COLORS.primary}
          style={{ marginRight: 7 }}
        />
      )}
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{(value && value !== 'undefined') ? value : '-'}</Text>
    </View>
  );
}

function AnimatedModuleCard({ mod, idx }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  // Display module name or fallback info
  let label = '';
  if (mod && typeof mod === 'object' && !Array.isArray(mod)) {
    label = mod.name || mod.title || mod.module_code || `Module ${idx + 1}`;
  } else {
    label = typeof mod === 'string' ? mod : `Module ${idx + 1}`;
  }

  return (
    <Animated.View style={[styles.moduleCard, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.moduleContent}
        android_ripple={{ color: COLORS.lightBorder }}
      >
        <MaterialCommunityIcons
          name="cube-outline"
          size={22}
          color={COLORS.primary}
          style={{ marginRight: 12 }}
        />
        <Text style={styles.moduleItem}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 44 : 8,
    paddingBottom: 18,
    paddingHorizontal: SPACING,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 5,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  headerBackBtn: {
    marginRight: 10,
    padding: 6,
    borderRadius: 50,
    // backgroundColor: COLORS.accentBackground,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    flex: 1,
    fontWeight: 'bold',
    paddingLeft: 4,
    letterSpacing: 0.7,
  },
  scrollContent: {
    padding: SPACING + 2,
    paddingBottom: 54,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING + 4,
    marginBottom: SPACING * 1.5,
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.11,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textTitle,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    borderBottomColor: COLORS.lightBorder,
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.textSubtitle,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 90,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textTitle,
    flex: 1,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  moduleCard: {
    borderRadius: 10,
    backgroundColor: COLORS.accentBackground,
    marginBottom: 7,
    elevation: 1,
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.09,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  moduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  moduleItem: {
    fontSize: 15,
    color: COLORS.textBody,
    flexShrink: 1,
  },
  emptyModuleText: {
    color: COLORS.mediumGray,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 10,
  },
  browseBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING * 1.6,
    borderRadius: 13,
    paddingVertical: 17,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  browseBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 8,
    letterSpacing: 0.5,
  },
  centeredFeedback: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    paddingVertical: 28,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textBody,
    marginTop: 14,
  },
});
