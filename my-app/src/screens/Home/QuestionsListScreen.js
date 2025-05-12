// QuestionsListScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Platform, StatusBar, Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import Markdown from 'react-native-markdown-display';
// Remove Katex import.
import RenderHTML from 'react-native-render-html';
import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';

export default function QuestionsListScreen() {
  // --- Helper: format question for share/copy ---
  function formatQuestion(item) {
    let metaParts = [];
    if (item.year) metaParts.push(item.year);
    if (item.qNumber || item.question_code_identifier) metaParts.push(item.qNumber || item.question_code_identifier);
    if (item.marks) metaParts.push(`${item.marks} Marks`);
    let header = metaParts.join(' | ');
    let moduleLabel = "";
    if (item.chapter_module_name) {
      // Remove Module, numbers, colons
      moduleLabel = item.chapter_module_name.replace(/^Module\s*\d*\s*:?\s*/i, "");
    }
    let s = "";
    if (header) s += header + "\n";
    if (moduleLabel) s += `Module: ${moduleLabel}\n`;
    s += item.text || "";
    return s.trim();
  }

  // --- Share using react-native Share API ---
  async function handleShareQuestion(item) {
    try {
      const text = formatQuestion(item);
      await Share.share({ message: text });
    } catch (err) {
      alert('Could not share question. ' + err?.message || String(err));
    }
  }

  // --- Copy to clipboard using expo-clipboard ---
  async function handleCopyQuestion(item) {
    try {
      await Clipboard.setStringAsync(formatQuestion(item));
    } catch (err) {
      alert('Could not copy. ' + err?.message || String(err));
    }
  }
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

// ... previous code (no changes to QuestionsListScreen) ...

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
            <QuestionMarkdownMathHTML
              text={item.text || "No question text available."}
              cardWidth={styles.questionCardV2.width || 340}
            />
            {/* Action Row */}
            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.cardActionIcon}
                onPress={() => handleShareQuestion(item)}
              >
                <MaterialCommunityIcons name="share-variant" size={22} color="#8893a6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionIcon}
                onPress={() => handleCopyQuestion(item)}
              >
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

/**
 * Renders markdown+math as HTML inside a card, with full whitespace/math/image support.
 * Uses markdown-it + markdown-it-katex for server-side conversion; react-native-render-html for display.
 */
function QuestionMarkdownMathHTML({ text, cardWidth }) {
  // Configure markdown-it with KaTeX for inline/block math
  const md = React.useMemo(() => {
    return MarkdownIt({ breaks: true, html: true })
      .use(markdownItKatex, { throwOnError: false, errorColor: " #cc0000" });
  }, []);
  // Compile markdown+math to HTML
  const html = React.useMemo(() => md.render(text || ""), [md, text]);
  // For images to scale, pass contentWidth.
  const width = cardWidth || 300;
  return (
    <RenderHTML
      contentWidth={width}
      source={{ html }}
      baseStyle={{ fontSize: 16, color: COLORS.textBody, lineHeight: 23 }}
      systemFonts={['Arial', 'Menlo', 'monospace', 'sans-serif']}
      enableExperimentalBRCollapsing={true}
      tagsStyles={{
        img: {
          maxWidth: "100%",
          borderRadius: 7,
          marginVertical: 7,
          backgroundColor: "#f8f8fc"
        },
        code: {
          backgroundColor: "#eeeefa",
          borderRadius: 6,
          padding: 3,
          fontSize: 15,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
          color: "#705dc7",
        },
        pre: {
          backgroundColor: "#eeedfa",
          borderRadius: 7,
          padding: 7,
          marginVertical: 5,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        },
        p: { marginVertical: 4 },
        li: { marginVertical: 1 },
        ul: { marginLeft: 16 },
        ol: { marginLeft: 16 },
        h1: { fontSize: 20, fontWeight: "bold", color: COLORS.primaryDark },
        h2: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
        h3: { fontSize: 16, fontWeight: "bold" },
      }}
      enableExperimentalRtl={false}
      ignoredStyles={['width', 'height', 'fontFamily']}
    />
  );
}

// --- MarkdownQuestionImage: safe hooks for skeleton, error, tap-to-zoom ---
function MarkdownQuestionImage({ src, alt, width, height, restProps }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);

  const imageProps = { ...restProps };
  if (width && height) {
    imageProps.width = Number(width);
    imageProps.height = Number(height);
  }
  return (
    <View style={{ alignItems: "center", marginVertical: 7 }}>
      <TouchableOpacity
        onPress={() => setZoomed(true)}
        activeOpacity={0.8}
        style={{ width: imageProps.width || "100%", borderRadius: 7, backgroundColor: "#f7f8fa" }}
      >
        <View style={{ justifyContent: "center", alignItems: "center", minHeight: 100 }}>
          {loading && !error && (
            <ActivityIndicator
              size="small"
              color="#b2b1df"
              style={{ position: "absolute", zIndex: 1, top: "50%", left: "50%", marginLeft: -10, marginTop: -10 }}
            />
          )}
          {error && (
            <MaterialCommunityIcons name="image-broken-variant" color="#ccc" size={40}
              style={{ marginVertical: 20 }} />
          )}
          <Image
            source={{ uri: src }}
            alt={alt}
            style={{
              width: imageProps.width || 240,
              height: imageProps.height || 180,
              maxWidth: "100%",
              resizeMode: "contain",
              borderRadius: 7,
              opacity: loading ? 0.6 : 1,
              display: error ? "none" : "flex"
            }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
            accessible={true}
            accessibilityLabel={alt}
          />
        </View>
      </TouchableOpacity>
      {/* Modal: show zoomed image */}
      {zoomed && !error && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 10,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            activeOpacity={1}
            onPress={() => setZoomed(false)}
          />
          <Image
            source={{ uri: src }}
            style={{
              width: "94%",
              height: "68%",
              maxWidth: 340,
              resizeMode: "contain",
              borderRadius: 8,
            }}
          />
          <Text style={{ color: "#fff", fontSize: 16, marginTop: 18, fontWeight: "500" }}>{alt || "Tap outside to close"}</Text>
        </View>
      )}
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

// --- Styles for Markdown content inside the card ---
const markdownStyles = {
  body: {
    color: COLORS.textBody,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24.5,
    marginBottom: 19,
    marginTop: 2
  },
  paragraph: {
    marginTop: 2,
    marginBottom: 6,
  },
  strong: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  em: {
    fontStyle: 'italic'
  },
  code_inline: {
    backgroundColor: "#eeeefa",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#705dc7"
  },
  code_block: {
    backgroundColor: "#eeedfa",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 6,
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#333",
    marginVertical: 5
  },
  fence: {
    backgroundColor: "#eeedfa",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 6,
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#333",
    marginVertical: 5
  },
  image: {
    marginVertical: 7,
    borderRadius: 7,
    width: "100%",
    maxWidth: "100%",
    resizeMode: "contain",
    backgroundColor: "#f8f8fc"
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: "#f3f2fa",
    paddingLeft: 11,
    marginVertical: 8
  },
  bullet_list: {
    marginVertical: 5
  },
  ordered_list: {
    marginVertical: 5
  },
  list_item: {
    flexDirection: "row",
    marginVertical: 2
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 0,
    color: COLORS.primaryDark
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 0,
    color: COLORS.primary
  },
  heading3: {
    fontSize: 17,
    fontWeight: 'bold'
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: "underline"
  },
};
