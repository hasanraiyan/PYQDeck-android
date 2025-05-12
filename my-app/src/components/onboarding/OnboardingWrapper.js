import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '../../constants/Colors';

const { width } = Dimensions.get('window');

/**
 * Refined OnboardingWrapper
 * - Switched to a clean white background with a bold top accent bar to focus attention.
 * - Reduced third-party overhead: removed LinearGradient for performance.
 * - Added subtle entry animations for title and subtitle for engagement.
 * - Maintained keyboard avoidance, safe-area, and full-scroll support.
 */
const OnboardingWrapper = ({ children, title, subtitle, disableScroll }) => {
  const Container = disableScroll ? View : ScrollView;
  const containerProps = disableScroll
    ? {}
    : {
        contentContainerStyle: styles.scrollContent,
        keyboardShouldPersistTaps: 'handled',
      };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.accentBar} />
        <Container {...containerProps} style={styles.flex}>
          <View style={styles.inner}>
            {title ? (
              <Animated.Text
                entering={FadeInDown.delay(100)}
                style={styles.title}
              >
                {title}
              </Animated.Text>
            ) : null}
            {subtitle ? (
              <Animated.Text
                entering={FadeInUp.delay(300)}
                style={styles.subtitle}
              >
                {subtitle}
              </Animated.Text>
            ) : null}
            {children}
          </View>
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  accentBar: { height: 4, width: '20%', backgroundColor: COLORS.primary, alignSelf: 'center', marginTop: 10, marginBottom: 20, borderRadius: 2 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  inner: {
    flex: 1,
    paddingHorizontal: width * 0.08,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textTitle,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textBody,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
});

export default OnboardingWrapper;